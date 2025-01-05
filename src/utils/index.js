import * as BufferLayout from "buffer-layout";

export const TokenSaleAccountLayout = BufferLayout.struct([
    BufferLayout.u8("isInitialized"),
    BufferLayout.blob(32, "ownerAccountPubkey"),
    BufferLayout.blob(32, "ownerTokenAccountPubkey"),
    BufferLayout.blob(8, "approvedAmount"),
    BufferLayout.blob(8, "rewardedAmount")
]);
  
export const UserSateAccountLayout = BufferLayout.struct([
    BufferLayout.blob(8, "rewardedAmount")
]);

export const bufferToNumber = (value) => {
	const buffer = new Uint8Array(value);
	const dataView = new DataView(buffer.buffer);
	return Number(dataView.getBigUint64(0, true));
}

export const createAccountInfo = (pubkey, isSigner, isWritable) => {
	return {
		pubkey: pubkey,
		isSigner: isSigner,
		isWritable: isWritable,
	};
};