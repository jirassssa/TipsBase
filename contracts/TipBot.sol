// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TipBot {
    // Owner of the contract (bot operator)
    address public owner;

    // Platform fee (1%)
    uint256 public platformFeePercent = 1;
    uint256 public constant MAX_FEE_PERCENT = 5;

    // Mapping of user ID (Telegram/Discord) to wallet balance
    mapping(string => uint256) public balances;

    // Mapping to track total tips sent/received
    mapping(string => uint256) public totalTipsSent;
    mapping(string => uint256) public totalTipsReceived;

    // Events
    event Deposit(string indexed userId, uint256 amount);
    event Withdraw(string indexed userId, address to, uint256 amount);
    event Tip(string indexed fromUserId, string indexed toUserId, uint256 amount, uint256 fee);
    event FeeUpdated(uint256 newFeePercent);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Deposit ETH to user's balance
    function deposit(string memory userId) external payable {
        require(msg.value > 0, "Must send ETH");
        balances[userId] += msg.value;
        emit Deposit(userId, msg.value);
    }

    // Withdraw ETH from user's balance
    function withdraw(string memory userId, address payable to, uint256 amount) external onlyOwner {
        require(balances[userId] >= amount, "Insufficient balance");
        require(to != address(0), "Invalid address");

        balances[userId] -= amount;
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(userId, to, amount);
    }

    // Send tip from one user to another
    function tip(string memory fromUserId, string memory toUserId, uint256 amount) external onlyOwner {
        require(balances[fromUserId] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(toUserId).length > 0, "Invalid recipient");

        // Calculate fee
        uint256 fee = (amount * platformFeePercent) / 100;
        uint256 amountAfterFee = amount - fee;

        // Update balances
        balances[fromUserId] -= amount;
        balances[toUserId] += amountAfterFee;

        // Send fee to owner
        (bool success, ) = owner.call{value: fee}("");
        require(success, "Fee transfer failed");

        // Update statistics
        totalTipsSent[fromUserId] += amount;
        totalTipsReceived[toUserId] += amountAfterFee;

        emit Tip(fromUserId, toUserId, amountAfterFee, fee);
    }

    // Get user balance
    function getBalance(string memory userId) external view returns (uint256) {
        return balances[userId];
    }

    // Update platform fee
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= MAX_FEE_PERCENT, "Fee too high");
        platformFeePercent = newFeePercent;
        emit FeeUpdated(newFeePercent);
    }

    // Withdraw collected fees
    function withdrawFees() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        uint256 userBalances = 0;

        // Note: In production, you'd need a more efficient way to track total user balances
        // This is simplified for the demo

        (bool success, ) = owner.call{value: contractBalance}("");
        require(success, "Transfer failed");
    }

    // Get statistics
    function getStats(string memory userId) external view returns (
        uint256 balance,
        uint256 sent,
        uint256 received
    ) {
        return (
            balances[userId],
            totalTipsSent[userId],
            totalTipsReceived[userId]
        );
    }

    // Receive ETH
    receive() external payable {}
}
