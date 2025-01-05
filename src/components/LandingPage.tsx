import React, { useEffect, useState, useContext } from "react";
import svg from "../assets/svg";
import Img from "../assets/pepeImages";
import tabList from "../assets/buttonList.png";
import { Link, useNavigate } from "react-router-dom";
import "../animation.scss";
import ellipse_img from '../assets/ellipse.svg';
import score_coin from '../assets/score-coin.png';
import score_back from '../assets/score-back-1.png';
import medal_1 from '../assets/medal-1.png';
import medal_2 from '../assets/medal-2.png';
import medal_3 from '../assets/medal-3.png';

// hooks to solana
import {
  Connection,
  PublicKey,
  clusterApiUrl
} from "@solana/web3.js";
import ConnectWalletButton from "../ConnectWalletButton";

//context start
import axios from "axios";
import { WalletContext } from "../context/WalletContext";
import { UserSateAccountLayout, bufferToNumber } from "../utils";
import { LAMPORTS_PER_TOKEN, rewardProgramAddress } from "../constants";
import Loading from "./Loading";

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
const LandingPage: React.FC = () => {
  //blockchain
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [rewardedAmount, setRewardedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState(false);

  const navigator = useNavigate();

  //context start
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const walletContext = useContext(WalletContext);
  const publicKey = walletContext?.publicKey;
  const connectWallet = walletContext?.connectWallet;

  const [scores, setScores] = useState<Scores>({
    accumulatedScore: 0,
    highestScore: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

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
  const shortenAddress = (address: string , limit: number): string => {
    return `${address.slice(0, limit)}...${address.slice( 0 - limit )}`;
  };

  const onStartGame = (): void => {
    try {
      console.log('publicKey', publicKey)
      if (!!publicKey) {
        navigator('/game');
      } else {
        setModalStatus(true);
      }
    } catch (error) {
      console.error("Error starting game: ", error);
    }
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

  //context ends

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
      <div className="w-full max-w-[1440px] relative pb-30 xl:h-[100vh]">
        <div className="flex flex-col items-center xl:flex-row xl:justify-between xl:items-start">
          <div className="w-full max-w-[700px] px-[20px] xl:max-w-[50%] pt-20">
            {/* title */}
            <div className="mb-10 xl:mb-16" data-aos="fade-down">
              <p className="xl:text-[45px] md:text-[40px] text-[35px] font-sans text-white text-center xl:text-left">
                <span>Play PEPE TRUMP FROG Game To Collect MONEY</span>
              </p>
            </div>

            {/* token amount */}
            <div
              className="flex flex-row justify-center items-center relative mb-16 xl:mb-32 max-w-[600px]"
              data-aos="fade-up"
              data-aos-duration="500"
            >
              <div className="w-full p-1 relative">
                <img src={score_back} alt="score_back" className="h-[80px] w-[100%]" />
                <p className="font-bold font-sans xl:text-[40px] md:text-[30px] text-[28px] absolute xl:top-[8px] md:top-[8px] top-[15px] left-0 right-0 flex items-center justify-center">
                  <span className="text-[#000]">
                    Score: {publicKey && !loading ? (scores.accumulatedScore - rewardedAmount) : 0}
                  </span>
                </p>
              </div>
              <div className="absolute left-[-10px] xl:left-[-20px] top-1/2 transform -translate-y-1/2 h-full flex items-center xl:w-full">
                <img src={score_coin} alt="score_coin" className="w-[110px] mb-[10px]" />
              </div>
            </div>

            {/* cat image */}
            <div className="w-full xl:hidden relative" data-aos="zoom-in-up">
              <div className="w-full rounded-[90px] overflow-hidden">
                <div>
                  <img src={Img[currentImgIndex]} className="w-full" />
                </div>
                <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[rgba(1,15,26,1)] via-[rgba(14,19,40,0.5)] to-[rgba(14,19,40,1)] text-white"></div>
              </div>
            </div>

            {/* leader board */}
            <div
              className="relative"
              data-aos="fade-right"
              data-aos-offset="300"
              data-aos-easing="ease-in-sine"
            >
              <div className="absolute left-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-[13px] border-[3px] bg-[#0B1225] p-[3px]">
                <p className="font-sans text-[24px] xl:text-[32px] text-white p-1 xl:p-2">
                  Leader-Board
                </p>
              </div>
              <div className="border-[3px] rounded-[30px] border-[#BED9E6] bg-transparent sm:px-[10px] py-[40px] xl:p-[40px] w-full">
                <div className="w-full flex flex-row gap-2 xl:gap-10 p-2 justify-center items-center">
                  <div className="shrink-0">
                    <img src={medal_1} alt="medal_1" className="w-[28px]" />
                  </div>
                  <div className="rounded-full border-2 border-white overflow-hidden w-[40px] h-[40px] bg-[url('./assets/avatar1.jpg')] bg-cover shrink-0"></div>
                  <div className="grow rounded-md border-transparent bg-[#434553] p-3 flex flex-row justify-between gap-10 font-jua text-white text-[17px] text-left">
                    <p>
                      {leaderboard.length > 0
                        ? shortenAddress(leaderboard[0].walletAddress , 4)
                        : "No entry"}
                    </p>
                    <p className=" grow hidden xl:flex xl:flex-row xl:gap-2 xl:items-center">
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-yellow-400">{svg.fullStar}</span>
                    </p>
                    <div className="flex items-center">
                      {leaderboard.length > 0
                        ? leaderboard[0].accumulatedScore
                        : 0}
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-row gap-2 xl:gap-10 p-2 justify-center items-center">
                  <div className="shrink-0">
                    <img src={medal_2} alt="medal_2" className="w-[28px]" />
                  </div>
                  <div className="rounded-full border-2 border-white overflow-hidden w-[40px] h-[40px] bg-[url('./assets/avatar1.jpg')] bg-cover shrink-0"></div>
                  <div className="grow rounded-md border-transparent bg-[#434553] p-3 flex flex-row justify-between gap-10 font-jua text-white text-[17px] text-left">
                    <p>
                      {leaderboard.length > 1
                        ? shortenAddress(leaderboard[1].walletAddress , 4 )
                        : "No entry"}
                    </p>
                    <p className="grow hidden xl:flex xl:flex-row xl:gap-2 xl:items-center">
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-gray-400">{svg.fullStar}</span>
                    </p>
                    <div className="flex items-center">
                      {leaderboard.length > 1
                        ? leaderboard[1].accumulatedScore
                        : 0}
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-row gap-2 xl:gap-10 p-2 justify-center items-center">
                  <div className="shrink-0">
                    <img src={medal_3} alt="medal_3" className="w-[28px]" />
                  </div>
                  <div className="rounded-full border-2 border-white overflow-hidden w-[40px] h-[40px] bg-[url('./assets/avatar1.jpg')] bg-cover shrink-0"></div>
                  <div className="grow rounded-md border-transparent bg-[#434553] p-3 flex flex-row justify-between gap-10 font-jua text-white text-[17px] text-left flex-1">
                    <p>
                      {leaderboard.length > 2
                        ? shortenAddress(leaderboard[2].walletAddress , 4)
                        : "No entry"}
                    </p>
                    <p className=" grow hidden xl:flex xl:flex-row xl:gap-2 xl:items-center">
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-yellow-400">{svg.fullStar}</span>
                      <span className="text-gray-400">{svg.fullStar}</span>
                      <span className="text-gray-400">{svg.fullStar}</span>
                    </p>
                    <div className="flex items-center">
                      {leaderboard.length > 2
                        ? leaderboard[2].accumulatedScore
                        : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="w-full max-w-[700px] px-5 mt-5 xl:hidden"
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className="w-full relative">
              <div className="w-full">
                <img src={tabList} className="w-full" />
              </div>
              <div className="absolute top-0 left-0 w-full flex flex-col grow sm:pt-[80px] pt-[12vw]">
                <div className="font-bold sm:text-[40px] text-[30px] font-sans sm:mb-[80px] mb-[12vw] menuBtn">
                  <ConnectWalletButton />
                </div>
                <p className="font-bold sm:text-[40px] text-[30px] font-sans sm:mb-[80px] mb-[12vw] menuBtn" onClick={onStartGame}>
                  <span>Start Game</span>
                </p>
                <p className="font-bold sm:text-[40px] text-[30px] font-sans menuBtn">
                  <Link to="/shop">Shop</Link>
                </p>
              </div>
            </div>
          </div>

          {/* cat image */}
          <div className="relative w-full max-w-[700px] h-screen hidden xl:block">
            <div
              className="absolute top-0 right-0 w-[576px] h-[576px] rounded-[167px] overflow-hidden hidden xl:block"
              data-aos="zoom-in-up"
            >
              <div>
                <img src={Img[currentImgIndex]} className="w-full" />
              </div>
              <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[rgba(1,15,26,1)] via-[rgba(14,19,40,0.5)] to-[rgba(14,19,40,1)] text-white"></div>
            </div>
            <div
              className="absolute w-full xl:w-[540px] xl:h-[500px] bottom-0 xl:right-[20px] bg-[url('./assets/buttonList.png')] bg-cover"
              data-aos="fade-up"
              data-aos-anchor-placement="top-center"
            >
              <div className="flex flex-col grow pt-[65px]">
                <div className="font-bold xl:text-[40px] md:text-[40px] text-[30px] font-sans mb-[60px] menuBtn">
                  <ConnectWalletButton />
                </div>
                <p className="font-bold xl:text-[40px] md:text-[40px] text-[30px] font-sans mb-[60px] menuBtn" onClick={onStartGame}>
                  <span>Start Game</span>
                </p>
                <p className="font-bold xl:text-[40px] md:text-[40px] text-[30px] font-sans menuBtn">
                  <Link to="/shop">Shop</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {modalStatus && (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-[#00000040] transition-opacity" aria-hidden="true"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-xl text-left shadow-xl transition-all sm:my-8 backdrop-blur-xl bg-[#ffffff11] border-[#ffffffaa] border-2 max-w-[650px] w-full">
                <div className="xl:p-[50px] md:p-[50px] sm:p-[30px] p-[20px] flex flex-col items-center">
                  <p className="font-bold text-[31px] font-sans mb-[10px] text-white text-center">
                    <span>Playing without Wallet Connect?</span>
                  </p>
                  <p className="font-bold text-[26px] font-sans text-[#E58C37] text-center max-w-[450px]">
                    <span>Continuing without wallet Won’t save the score</span>
                  </p>
                  <div className="flex gap-2 justify-between items-center w-[100%] max-w-[450px] mt-[100px]">
                    <button className="font-bold text-[26px] font-sans cursor-pointer text-[#3DCC09]" onClick={() => {
                      !!connectWallet && connectWallet();
                      setModalStatus(false);
                    }}>
                      Connect Wallet
                    </button>
                    <button className="font-bold text-[26px] font-sans cursor-pointer text-white" onClick={() => navigator('/game')}>
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* footer */}
      <div className="fixed w-full h-24 bottom-0 bg-[url('assets/footer.png')] bg-cover"></div>

      {loading && <Loading />}
    </div>
  );
};
export default LandingPage;
