import {
  Movie as MovieIcon,
  Tv as TvIcon,
  MovieTwoTone as MovieTwoToneIcon,
  TvTwoTone as TvTwoToneIcon
} from '@material-ui/icons/';

export default class ShowType {
  static TV = 'tv';
  static MOVIE = 'movie';

  static toIcon(type) {
    return type === this.TV ? TvIcon : MovieIcon;
  }

  static toTwoToneIcon(type) {
    return type === this.TV ? TvTwoToneIcon : MovieTwoToneIcon;
  }
}