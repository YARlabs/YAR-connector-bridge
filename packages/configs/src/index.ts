import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export * from "./bridges_addresses";
export * from "./chains_config";
export * from "./explorers_api_keys";
export * from "./validators_private_keys";
 
