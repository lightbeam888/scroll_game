import React, { useEffect, useState, useContext } from "react";
import svg from "../assets/svg";
import Img from "../assets/pepeImages";
import "../animation.scss";
import arrow_img from '../assets/arrow.png';
import ellipse_img from '../assets/ellipse.svg'
import score_coin from '../assets/score-coin.png';
import score_back from '../assets/score-back-2.png';
 
// hooks to solana
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";

//context start
import axios from "axios";
import { WalletContext } from "../context/WalletContext";
import { UserSateAccountLayout, bufferToNumber, createAccountInfo } from "../utils";
import { defaultTokenAddress, ownerPubkey, ownerTokenAccount, rewardProgramAddress, rewardProgramDataAccount, LAMPORTS_PER_TOKEN } from "../constants";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import BN from "bn.js";
import { showToast } from "../helper";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";

interface Scores {
  accumulatedScore: number;
  highestScore: number;
}

interface LeaderboardEntry {
  walletAddress: string;
  accumulatedScore: number;
}
//context end

declare global {
  interface Window {
    solana?: any; // Add Phantom wallet to the window interface
  }
}
// end of solana
const ShopPage: React.FC = () => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [rewardedAmount, setRewardedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);

  const navigator = useNavigate();

  //context start

  const walletContext = useContext(WalletContext);
  const publicKey = walletContext?.publicKey;
  const connectWallet = walletContext?.connectWallet;

  const [scores, setScores] = useState<Scores>({
    accumulatedScore: 0,
    highestScore: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Get user scores
  const getScores = async (): Promise<Scores> => {
    if (!publicKey) {
      return {
        accumulatedScore: 0,
        highestScore: 0,
      };
    }
    try {
      const response = await axios.get<Scores>(
        `https://trump-game.onrender.com/get-score/${publicKey.toBase58()}`
      );
      setScores(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching scores", error);
    }
    return {
      accumulatedScore: 0,
      highestScore: 0,
    };
  }

  // Get user data of account
  const getUserData = async (): Promise<number> => {
    try {
      if (!!publicKey) {
        const userPDA = PublicKey.findProgramAddressSync([publicKey.toBuffer()], new PublicKey(rewardProgramAddress));
        const dataAccount = await connection.getAccountInfo(new PublicKey(userPDA[0]));
        if (!!dataAccount && dataAccount.data.length !== 0) {
          const _data = UserSateAccountLayout.decode(dataAccount.data);
          const _rewarded_amount = Math.round(bufferToNumber(_data.rewardedAmount) / LAMPORTS_PER_TOKEN * 10) / 10;
          setRewardedAmount(_rewarded_amount);
          return _rewarded_amount;
        } else {
          setRewardedAmount(0);
          return 0;
        }
      }
    } catch (error) {
      console.error("Error getting user data: ", error)
    }
    return 0;
  }

  const getInitData = async (): Promise<void> => {
    try {
      setLoading(true);
      await getScores();
      await getUserData();
    } catch (error) {
      console.error("Error getting initial data: ", error)
    }
    setLoading(false);
  }

  useEffect(() => {
    getInitData();
  }, [publicKey]);

  // Fetch leaderboard
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await axios.get<LeaderboardEntry[]>(
          "https://trump-game.onrender.com/leaderboard"
        );
        setLeaderboard(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      }
    }

    fetchLeaderboard();
  }, []);

  // Handle button click (connect/disconnect)
  const handleClick = (): void => {
    if (!!publicKey) {
      rewardToken();
    } else {
      !!connectWallet && connectWallet();
    }
  };

  // Check token account exist
  const checkIfTokenAccountExists = async (connection: Connection, receiverTokenAccountAddress: PublicKey): Promise<boolean> => {
    try {
      await getAccount(connection, receiverTokenAccountAddress, "confirmed", TOKEN_PROGRAM_ID);
      return true;
    } catch (error: any) {
      if (error.name === "TokenAccountNotFoundError") {
        return false;
      }
      throw error;
    }
  };

  // Reward token
  const rewardToken = async (): Promise<void> => {
    try {
      const { solana } = window;
      if (!!publicKey && !!solana.signTransaction) {
        setTxLoading(true);
        let reward_amount = 0;

        try {
          const scores = await getScores();
          const _rewarded_amount = await getUserData();
          reward_amount = scores.accumulatedScore - _rewarded_amount;
        } catch (error) {
          setTxLoading(false);
        }
      
        if (reward_amount <= 0) {
          setTxLoading(false);
          return showToast("You don't have score.", "warning");
        }

        const programId = new PublicKey(rewardProgramAddress);
        const programDataAccount = new PublicKey(rewardProgramDataAccount);
        const tokenAddress = new PublicKey(defaultTokenAddress);
        const _ownerPubkey = new PublicKey(ownerPubkey);
        const _ownerTokenAccount = new PublicKey(ownerTokenAccount);
        const instruction = 1;

        const userTokenAccount = getAssociatedTokenAddressSync(tokenAddress, publicKey);
        const PDA = PublicKey.findProgramAddressSync([Buffer.from("reward_token")], programId);
        const userPDA = PublicKey.findProgramAddressSync([publicKey.toBuffer()], programId);

        const transaction = new Transaction();

        const isTokenAccountExist = await checkIfTokenAccountExists(connection, userTokenAccount);
        if (!isTokenAccountExist) {
          const createTokenAccount = createAssociatedTokenAccountInstruction(
            publicKey,
            userTokenAccount,
            publicKey,
            tokenAddress,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          );
          transaction.add(createTokenAccount);
        }

        const buyToken = new TransactionInstruction({
          programId: programId,
          keys: [
            createAccountInfo(publicKey, true, true),
            createAccountInfo(_ownerPubkey, false, true),
            createAccountInfo(_ownerTokenAccount, false, true),
            createAccountInfo(userPDA[0], false, true),
            createAccountInfo(SYSVAR_RENT_PUBKEY, false, false),
            createAccountInfo(programDataAccount, false, true),
            createAccountInfo(SystemProgram.programId, false, false),
            createAccountInfo(userTokenAccount, false, true),
            createAccountInfo(TOKEN_PROGRAM_ID, false, false),
            createAccountInfo(PDA[0], false, false)
          ],
          data: Buffer.from(Uint8Array.of(instruction, ...new BN(reward_amount * LAMPORTS_PER_TOKEN).toArray("le", 8))),
        });

        transaction.add(buyToken);
        const blockHash = await connection.getLatestBlockhash();
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = blockHash.blockhash;

        const signed = await solana.signTransaction(transaction)
        const signature = await connection.sendRawTransaction(signed.serialize())
        await connection.confirmTransaction(signature, "confirmed");
  
        showToast("The transaction was completed successfully.", "success");
        getUserData();
      }
    } catch (error) {
      console.error("Error rewarding token: ", error);
      showToast("The transaction failed.", "error");
    }
    setTxLoading(false);
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImgIndex((prevIndex) => (prevIndex + 1) % Img.length);
    }, 1000); // 1000 milliseconds = 1 second

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full xl:min-h-screen flex flex-row justify-center bg-gradient-to-b from-[#031c02] to-[#0f1a0f]">
      <img src={ellipse_img} alt="ellipse" className="fixed top-[-50px] left-[-150px] w-[400px] z-0" />
      <img src={ellipse_img} alt="ellipse" className="fixed top-[40vh] left-[50px] w-[500px] z-0" />
      <img src={ellipse_img} alt="ellipse" className="fixed bottom-[-50px] right-[-150px] w-[500px] z-0" />
      {/* container */}
      <div className="w-full max-w-[1440px] relative pb-30 h-[100vh]">
        <div className="flex flex-row justify-center items-between h-[100%]">
          <div className="w-full px-[20px] xl:max-w-[800px] flex flex-col justify-between py-[100px]">
            {/* title */}
            <div>
              <div className="mb-10 xl:mb-16 relative" data-aos="fade-down">
                <p
                  className="font-sans text-white text-[30px] xl:text-[40px] neon-text rotating-text break-words text-center"
                  data-text="reward your score"
                >
                  reward your score
                </p>
                <div className="absolute top-[-12px] right-[-100px] rotate-[280deg] xl:block md:block hidden">
                  <img src={arrow_img} alt="arrow_img" className="w-[80px]" />
                </div>
              </div>
              <div className="flex flex-col items-center xl:mt-[100px] sm:mt-[100px] mt-[50px]">
                <div className="max-w-[600px] w-full">
                  <div
                    className="flex flex-row justify-center items-center relative mb-[50px]"
                    data-aos="fade-up"
                    data-aos-duration="500"
                  >
                    <div className="w-full p-1 relative">
                      <img src={score_back} alt="score_back" className="h-[80px] w-[100%]" />
                      <p className="font-bold font-sans xl:text-[35px] md:text-[30px] sm:text-[25px] text-[15px] absolute xl:top-[15px] md:top-[12px] sm:top-[25px] top-[28px] left-0 right-0 flex items-center justify-center">
                        <span className="text-[#000]">
                          Current Score:{" "}
                          {publicKey && !loading ? (scores.accumulatedScore - rewardedAmount) : 0}
                        </span>
                      </p>
                    </div>
                    <div className="absolute left-[-10px] xl:left-[-20px] top-1/2 transform -translate-y-1/2 h-full flex items-center xl:w-full">
                      <img src={score_coin} alt="score_coin" className="w-[110px] mb-[10px]" />
                    </div>
                  </div>
                  <div
                    className="flex flex-row justify-center items-center relative "
                    data-aos="fade-up"
                    data-aos-duration="500"
                  >
                    <div className="w-full p-1 relative">
                      <img src={score_back} alt="score_back" className="h-[80px] w-[100%]" />
                      <p className="font-bold font-sans xl:text-[35px] md:text-[30px] sm:text-[25px] text-[15px] absolute xl:top-[15px] md:top-[12px] sm:top-[25px] top-[28px] left-0 right-0 flex items-center justify-center">
                        <span className="text-[#000]">
                          Rewarded Score:{" "}
                          {publicKey && !loading ? rewardedAmount : 0}
                        </span>
                      </p>
                    </div>
                    <div className="absolute left-[-10px] xl:left-[-20px] top-1/2 transform -translate-y-1/2 h-full flex items-center xl:w-full">
                      <img src={score_coin} alt="score_coin" className="w-[110px] mb-[10px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center flex-wrap xl:gap-[50px] md:gap-[30px] gap-[20px] mt-10">
              <button
                onClick={handleClick}
                className="font-bold xl:text-[35px] text-[30px] font-sans menuBtn"
              >
                <span className="text-[#3DCC09] [text-shadow:_10px_0px_10px_rgb(61_204_9_/_0.8)]">{!!publicKey ? "REWARD YOUR TOKEN" : "Connect Wallet"}</span>
              </button>
              {!!publicKey && (
                <button
                  onClick={() => navigator('/')}
                  className="font-bold xl:text-[35px] text-[30px] font-sans menuBtn"
                >
                  <span className="text-[#f44336] [text-shadow:_10px_0px_10px_rgb(244_67_54_/_0.8)]">CANCEL</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {(loading || txLoading) && <Loading />}
    </div>
  );
};
export default ShopPage;
