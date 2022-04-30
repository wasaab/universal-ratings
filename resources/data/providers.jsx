import NetflixIcon from '../images/netflix.svg';
import HuluIcon from '../images/hulu.svg';
import AmazonIcon from '../images/amazon.svg';
import HboIcon from '../images/hbo.svg';
import DisneyIcon from '../images/disney.svg';
import AppleIcon from '../images/apple.svg';
import PeacockIcon from '../images/peacock.svg';

export const disneyProviderId = 337;

const providerIdToInfo = {
  8: {
    name: 'netflix',
    networkId: 213,
    logo: NetflixIcon
  },
  15: {
    name: 'hulu',
    networkId: 453,
    logo: HuluIcon
  },
  9: {
    name: 'amazon',
    networkId: 1024,
    logo: AmazonIcon
  },
  384: {
    name: 'hbo',
    networkId: 3186,
    logo: HboIcon
  },
  [disneyProviderId]: {
    name: 'disney',
    networkId: 2739,
    logo: DisneyIcon
  },
  350: {
    name: 'apple',
    networkId: 2552,
    logo: AppleIcon
  },
  386: {
    name: 'peacock',
    networkId: 3353,
    logo: PeacockIcon
  }
};

export default providerIdToInfo;