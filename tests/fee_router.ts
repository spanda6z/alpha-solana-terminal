import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("fee_router", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("Is initialized!", async () => {
    // Placeholder – run after programs are built and IDs are real
    expect(true).to.be.true;
  });
});
