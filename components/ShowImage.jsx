import Image from 'next/image';
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  shortImg: {
    height: 200,
    position: 'relative'
  },
  tallImg: {
    height: 234,
    position: 'relative'
  }
});

const ShowImage = ({ show, tall }) => {
  const classes = useStyles();

  return (
    <div className={tall ? classes.tallImg : classes.shortImg}>
      {show.img && (
        <Image
          src={show.img}
          alt={show.title}
          layout="fill"
          objectFit="cover"
          objectPosition="top"
          unoptimized
        />
      )}
    </div>
  );
};

export default ShowImage;