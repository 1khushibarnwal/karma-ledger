// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {KarmaToken} from "../src/KarmaToken.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract KarmaTokenTest is Test {
    KarmaToken internal karma;

    uint256 internal signerPrivateKey = 0xA11CE;
    address internal signer;

    address internal alice = address(0xA11CE0001);
    address internal bob = address(0xB0B0002);

    function setUp() public {
        signer = vm.addr(signerPrivateKey);
        karma = new KarmaToken(signer);
    }

    function _sign(
        address recipient,
        uint256 score,
        string memory username,
        uint256 nonce
    ) internal view returns (bytes memory) {
        bytes32 payloadHash = keccak256(
            abi.encodePacked(recipient, score, username, nonce, address(karma))
        );

        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            payloadHash
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            signerPrivateKey,
            ethSignedHash
        );

        return abi.encodePacked(r, s, v);
    }

    function test_MintWithValidSignature() public {
        bytes memory sig = _sign(alice, 750, "alice-dev", 1);

        vm.prank(alice);
        karma.mintOrUpdateKarma(750, "alice-dev", 1, sig);

        uint256 tokenId = karma.tokenOfOwner(alice);

        assertEq(tokenId, 1);
        assertEq(karma.ownerOf(tokenId), alice);

        (uint256 score, string memory username, , uint8 tier) = karma.karmaOf(
            tokenId
        );

        assertEq(score, 750);
        assertEq(username, "alice-dev");
        assertEq(tier, 2); // Gold: 600-799
    }

    function test_RevertOnInvalidSignature() public {
        // Sign with a random key that is NOT the trusted signer
        uint256 wrongKey = 0xBAD;

        bytes32 payloadHash = keccak256(
            abi.encodePacked(
                alice,
                uint256(999),
                "alice-dev",
                uint256(1),
                address(karma)
            )
        );

        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            payloadHash
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongKey, ethSignedHash);

        bytes memory badSig = abi.encodePacked(r, s, v);

        vm.prank(alice);
        vm.expectRevert(KarmaToken.InvalidSignature.selector);
        karma.mintOrUpdateKarma(999, "alice-dev", 1, badSig);
    }

    function test_RevertOnReplayedSignature() public {
        bytes memory sig = _sign(alice, 500, "alice-dev", 42);

        vm.prank(alice);
        karma.mintOrUpdateKarma(500, "alice-dev", 42, sig);

        // Replaying the exact same signed payload must fail
        vm.prank(alice);
        vm.expectRevert(KarmaToken.SignatureAlreadyUsed.selector);
        karma.mintOrUpdateKarma(500, "alice-dev", 42, sig);
    }

    function test_UpdateScoreReusesSameTokenId() public {
        bytes memory sig1 = _sign(alice, 300, "alice-dev", 1);

        vm.prank(alice);
        karma.mintOrUpdateKarma(300, "alice-dev", 1, sig1);

        uint256 tokenId = karma.tokenOfOwner(alice);

        bytes memory sig2 = _sign(alice, 650, "alice-dev", 2);

        vm.prank(alice);
        karma.mintOrUpdateKarma(650, "alice-dev", 2, sig2);

        // Same token, new score — no second NFT minted
        assertEq(karma.tokenOfOwner(alice), tokenId);
        assertEq(karma.balanceOf(alice), 1);

        (uint256 score, , , uint8 tier) = karma.karmaOf(tokenId);

        assertEq(score, 650);
        assertEq(tier, 2); // Gold
    }

    function test_RevertOnTransfer() public {
        bytes memory sig = _sign(alice, 500, "alice-dev", 1);

        vm.prank(alice);
        karma.mintOrUpdateKarma(500, "alice-dev", 1, sig);

        uint256 tokenId = karma.tokenOfOwner(alice);

        vm.prank(alice);
        vm.expectRevert(KarmaToken.SoulboundToken.selector);
        karma.transferFrom(alice, bob, tokenId);
    }

    function test_RevertOnApprove() public {
        bytes memory sig = _sign(alice, 500, "alice-dev", 1);

        vm.prank(alice);
        karma.mintOrUpdateKarma(500, "alice-dev", 1, sig);

        uint256 tokenId = karma.tokenOfOwner(alice);

        vm.prank(alice);
        vm.expectRevert(KarmaToken.ApprovalsDisabled.selector);
        karma.approve(bob, tokenId);
    }

    function test_OnlyOwnerCanSetTrustedSigner() public {
        address newSigner = address(0xC0FFEE);

        vm.prank(alice); // not the contract owner
        vm.expectRevert();
        karma.setTrustedSigner(newSigner);

        // Contract owner (this test contract, as deployer) can update it
        karma.setTrustedSigner(newSigner);

        assertEq(karma.trustedSigner(), newSigner);
    }

    function test_TierBoundaries() public {
        _mintAndCheckTier(alice, 399, 0); // just under 400 -> Bronze
        _mintAndCheckTier(bob, 999, 3); // >=800 -> Platinum
    }

    function _mintAndCheckTier(
        address who,
        uint256 score,
        uint8 expectedTier
    ) internal {
        bytes memory sig = _sign(
            who,
            score,
            "tier-test",
            uint256(uint160(who))
        );

        vm.prank(who);
        karma.mintOrUpdateKarma(score, "tier-test", uint256(uint160(who)), sig);

        uint256 tokenId = karma.tokenOfOwner(who);

        (, , , uint8 tier) = karma.karmaOf(tokenId);

        assertEq(tier, expectedTier);
    }
}
