import Moralis from 'moralis';

export const initializeMoralis = async () => {
  await Moralis.start({
    apiKey: process.env.KEY_MORALIS,
  });
};
