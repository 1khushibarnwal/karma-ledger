// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title KarmaToken - a non-transferable ("soulbound") on-chain reputation badge
/// @notice The backend ML service computes a developer's karma score off-chain from
///         public GitHub activity, then signs that score. This contract verifies the
///         signature came from the trusted scorer before minting/updating a badge.
///         Tokens can NEVER be transferred or sold — reputation should not be tradeable.
contract KarmaToken is ERC721, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct KarmaData {
        uint256 score; // 0-1000 scale
        string githubUsername;
        uint256 timestamp;
        uint8 tier; // 0=Bronze 1=Silver 2=Gold 3=Platinum
    }

    // -------------------------------------------------------------------------
    // Custom Errors
    // -------------------------------------------------------------------------

    error ZeroAddress();
    error SignatureAlreadyUsed();
    error InvalidSignature();
    error SoulboundToken();
    error ApprovalsDisabled();

    // The address of the backend service authorized to sign scores
    address public trustedSigner;

    uint256 private _nextTokenId = 1;

    // wallet => tokenId (one soulbound badge per wallet, re-mintable/updatable)
    mapping(address => uint256) public tokenOfOwner;
    mapping(uint256 => KarmaData) public karmaOf;

    // prevent re-using the exact same signed payload twice
    mapping(bytes32 => bool) public usedSignatures;

    event KarmaMinted(
        address indexed to,
        uint256 tokenId,
        uint256 score,
        string githubUsername
    );

    event KarmaUpdated(address indexed to, uint256 tokenId, uint256 newScore);

    event SignerUpdated(address indexed oldSigner, address indexed newSigner);

    constructor(
        address _trustedSigner
    ) ERC721("KarmaLedger Reputation", "KARMA") Ownable(msg.sender) {
        if (_trustedSigner == address(0)) {
            revert ZeroAddress();
        }

        trustedSigner = _trustedSigner;

        emit SignerUpdated(address(0), _trustedSigner);
    }

    function setTrustedSigner(address _signer) external onlyOwner {
        if (_signer == address(0)) {
            revert ZeroAddress();
        }

        emit SignerUpdated(trustedSigner, _signer);

        trustedSigner = _signer;
    }

    /// @notice Mint or refresh your karma badge. Requires a signature from the trusted
    ///         backend attesting to (recipient, score, githubUsername, nonce).
    /// @dev `forge build` flags two low-severity style findings here that are already
    ///      handled: (1) the mint external call (`_safeMint` -> `onERC721Received`) is
    ///      guarded by `nonReentrant`, so event ordering after it cannot be exploited;
    ///      (2) `setTrustedSigner` does emit `SignerUpdated`, immediately before the write.
    function mintOrUpdateKarma(
        uint256 score,
        string calldata githubUsername,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        bytes32 payloadHash = keccak256(
            abi.encodePacked(
                msg.sender,
                score,
                githubUsername,
                nonce,
                address(this)
            )
        );

        if (usedSignatures[payloadHash]) {
            revert SignatureAlreadyUsed();
        }

        bytes32 ethSignedHash = payloadHash.toEthSignedMessageHash();
        address recovered = ethSignedHash.recover(signature);

        if (recovered != trustedSigner) {
            revert InvalidSignature();
        }

        usedSignatures[payloadHash] = true;

        uint256 existing = tokenOfOwner[msg.sender];

        if (existing == 0) {
            uint256 tokenId = _nextTokenId++;

            _safeMint(msg.sender, tokenId);

            tokenOfOwner[msg.sender] = tokenId;

            karmaOf[tokenId] = KarmaData(
                score,
                githubUsername,
                block.timestamp,
                _tierFor(score)
            );

            emit KarmaMinted(msg.sender, tokenId, score, githubUsername);
        } else {
            karmaOf[existing].score = score;
            karmaOf[existing].timestamp = block.timestamp;
            karmaOf[existing].tier = _tierFor(score);

            emit KarmaUpdated(msg.sender, existing, score);
        }
    }

    function _tierFor(uint256 score) internal pure returns (uint8) {
        if (score >= 800) return 3; // Platinum
        if (score >= 600) return 2; // Gold
        if (score >= 400) return 1; // Silver
        return 0; // Bronze
    }

    // -------------------------------------------------------------------------
    // Soulbound enforcement
    // -------------------------------------------------------------------------

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow mint (from == address(0)) and burn (to == address(0)).
        // Block transfers.
        if (from != address(0) && to != address(0)) {
            revert SoulboundToken();
        }

        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override {
        revert ApprovalsDisabled();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert ApprovalsDisabled();
    }
}
