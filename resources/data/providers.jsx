import NetflixIcon from '../images/netflix.svg';
import HuluIcon from '../images/hulu.svg';
import AmazonIcon from '../images/amazon.svg';
import HboIcon from '../images/hbo.svg';
import ShowtimeIcon from '../images/showtime.svg';
import DisneyIcon from '../images/disney.svg';
import AppleIcon from '../images/apple.svg';
import PeacockIcon from '../images/peacock.svg';
import RokuIcon from '../images/roku.svg';

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
  37: {
    name: 'showtime',
    networkId: 67,
    logo: ShowtimeIcon
  },
  337: {
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
  },
  207: {
    name: 'roku',
    networkId: 4692,
    logo: RokuIcon
  }
};

export const renderProviderLogo = (providerId) => {
  const { logo: ProviderLogo } = providerIdToInfo[providerId];

  return <ProviderLogo key={providerId} />;
};

export default providerIdToInfo;