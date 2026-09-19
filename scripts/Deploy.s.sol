// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {KarmaToken} from "../src/KarmaToken.sol";

/// @notice Deploys KarmaToken. Run with:
///   forge script script/Deploy.s.sol --rpc-url localhost --broadcast
/// The "trusted signer" is the backend's wallet address — it must match the address
/// derived from SIGNER_PRIVATE_KEY in server/.env, since that key is what signs every
/// score before a user can mint it on-chain.
contract DeployScript is Script {
    function run() external returns (KarmaToken) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address trustedSigner = vm.envAddress("SIGNER_ADDRESS");

        vm.startBroadcast(deployerKey);
        KarmaToken karma = new KarmaToken(trustedSigner);
        vm.stopBroadcast();

        console.log("KarmaToken deployed to:", address(karma));
        console.log("Trusted signer set to:", trustedSigner);
        console.log(
            "\nCopy the deployed address into server/.env as CONTRACT_ADDRESS"
        );
        console.log("and into client/.env as VITE_CONTRACT_ADDRESS");

        return karma;
    }
}
