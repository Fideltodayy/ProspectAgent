// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProspectAgentSubscription
 * @notice USDC-denominated subscription contract for ProspectAgent on Base L2.
 *         Businesses pay monthly in USDC to activate the AI prospecting agent
 *         on their behalf. The agent service reads subscription status on-chain
 *         before processing any company's monitoring jobs.
 *
 * @dev Deployed on Base L2. USDC address on Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
 */
contract ProspectAgentSubscription is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Types ────────────────────────────────────────────────────────────────

    enum Plan { None, Starter, Growth, Pro }

    struct Subscription {
        Plan plan;
        uint256 paidUntil;   // unix timestamp
        uint256 startedAt;
        uint256 renewalCount;
    }

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20 public immutable usdc;

    // Monthly prices in USDC (6 decimals)
    uint256 public starterPrice = 99 * 1e6;   // $99
    uint256 public growthPrice  = 299 * 1e6;  // $299
    uint256 public proPrice     = 799 * 1e6;  // $799

    // Trial: 1 day in seconds
    uint256 public constant TRIAL_DURATION = 1 days;
    uint256 public constant BILLING_PERIOD = 30 days;

    mapping(address => Subscription) public subscriptions;
    mapping(address => bool) public trialUsed;

    // The agent's authorized wallet — reads subscription state and is recorded
    // on-chain as the service provider
    address public agentWallet;

    // ─── Events ───────────────────────────────────────────────────────────────

    event TrialStarted(address indexed subscriber, uint256 expiresAt);
    event Subscribed(address indexed subscriber, Plan plan, uint256 paidUntil, uint256 amount);
    event Renewed(address indexed subscriber, Plan plan, uint256 newPaidUntil, uint256 amount);
    event Cancelled(address indexed subscriber);
    event PriceUpdated(Plan plan, uint256 newPrice);
    event AgentWalletUpdated(address newWallet);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error TrialAlreadyUsed();
    error InvalidPlan();
    error AlreadySubscribed();
    error NotSubscribed();
    error TransferFailed();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _usdc, address _agentWallet) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        agentWallet = _agentWallet;
    }

    // ─── Trial ────────────────────────────────────────────────────────────────

    /**
     * @notice Activate a 1-day free trial. One per wallet.
     */
    function startTrial() external {
        if (trialUsed[msg.sender]) revert TrialAlreadyUsed();
        trialUsed[msg.sender] = true;

        uint256 expiresAt = block.timestamp + TRIAL_DURATION;
        subscriptions[msg.sender] = Subscription({
            plan: Plan.Starter,
            paidUntil: expiresAt,
            startedAt: block.timestamp,
            renewalCount: 0
        });

        emit TrialStarted(msg.sender, expiresAt);
    }

    // ─── Subscribe ────────────────────────────────────────────────────────────

    /**
     * @notice Subscribe to a plan by paying USDC upfront for one billing period.
     * @param plan 1 = Starter ($99), 2 = Growth ($299), 3 = Pro ($799)
     */
    function subscribe(uint8 plan) external nonReentrant {
        if (plan == 0 || plan > 3) revert InvalidPlan();

        Subscription storage sub = subscriptions[msg.sender];
        // Allow subscribing over an expired sub or trial
        if (sub.plan != Plan.None && sub.paidUntil > block.timestamp) revert AlreadySubscribed();

        uint256 price = _planPrice(Plan(plan));
        usdc.safeTransferFrom(msg.sender, address(this), price);

        uint256 paidUntil = block.timestamp + BILLING_PERIOD;
        subscriptions[msg.sender] = Subscription({
            plan: Plan(plan),
            paidUntil: paidUntil,
            startedAt: block.timestamp,
            renewalCount: sub.renewalCount
        });

        emit Subscribed(msg.sender, Plan(plan), paidUntil, price);
    }

    /**
     * @notice Renew an existing active subscription for another billing period.
     */
    function renew() external nonReentrant {
        Subscription storage sub = subscriptions[msg.sender];
        if (sub.plan == Plan.None) revert NotSubscribed();

        uint256 price = _planPrice(sub.plan);
        usdc.safeTransferFrom(msg.sender, address(this), price);

        // Extend from current paidUntil (stacks on top if still active)
        uint256 base = sub.paidUntil > block.timestamp ? sub.paidUntil : block.timestamp;
        sub.paidUntil = base + BILLING_PERIOD;
        sub.renewalCount += 1;

        emit Renewed(msg.sender, sub.plan, sub.paidUntil, price);
    }

    /**
     * @notice Cancel — stops automatic renewal. Access continues until paidUntil.
     */
    function cancel() external {
        Subscription storage sub = subscriptions[msg.sender];
        if (sub.plan == Plan.None) revert NotSubscribed();
        sub.plan = Plan.None;
        emit Cancelled(msg.sender);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /**
     * @notice Check if an address has active access (trial or paid subscription).
     *         The agent service calls this before processing any company's jobs.
     */
    function hasAccess(address subscriber) external view returns (bool) {
        Subscription storage sub = subscriptions[subscriber];
        return sub.plan != Plan.None && sub.paidUntil > block.timestamp;
    }

    /**
     * @notice Get full subscription details for an address.
     */
    function getSubscription(address subscriber) external view returns (
        uint8 plan,
        uint256 paidUntil,
        uint256 startedAt,
        uint256 renewalCount,
        bool active
    ) {
        Subscription storage sub = subscriptions[subscriber];
        return (
            uint8(sub.plan),
            sub.paidUntil,
            sub.startedAt,
            sub.renewalCount,
            sub.plan != Plan.None && sub.paidUntil > block.timestamp
        );
    }

    function planPrice(uint8 plan) external view returns (uint256) {
        if (plan == 0 || plan > 3) revert InvalidPlan();
        return _planPrice(Plan(plan));
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function updatePrice(uint8 plan, uint256 newPrice) external onlyOwner {
        if (plan == 1) starterPrice = newPrice;
        else if (plan == 2) growthPrice = newPrice;
        else if (plan == 3) proPrice = newPrice;
        else revert InvalidPlan();
        emit PriceUpdated(Plan(plan), newPrice);
    }

    function setAgentWallet(address wallet) external onlyOwner {
        agentWallet = wallet;
        emit AgentWalletUpdated(wallet);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        usdc.safeTransfer(to, amount);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _planPrice(Plan plan) internal view returns (uint256) {
        if (plan == Plan.Starter) return starterPrice;
        if (plan == Plan.Growth)  return growthPrice;
        if (plan == Plan.Pro)     return proPrice;
        revert InvalidPlan();
    }
}
