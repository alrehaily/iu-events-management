import {
    IconRocket,
    IconCalendar,
    IconAlertTriangle,
    IconBolt,
    IconConfetti,
    IconInfoCircle,
    IconSpeakerphone,
    IconSparkles
} from '@tabler/icons-react';
import classes from './BouncingEmoji.module.scss';

interface BouncingEmojiProps {
    emoji: string;
    size?: number;
}

const getIconForEmoji = (emoji: string, iconSize: number) => {
    switch (emoji) {
        case '🚀':
            return <IconRocket size={iconSize} stroke={1.75} />;
        case '🎉':
            return <IconConfetti size={iconSize} stroke={1.75} />;
        case '⚡':
            return <IconBolt size={iconSize} stroke={1.75} />;
        case '📅':
            return <IconCalendar size={iconSize} stroke={1.75} />;
        case '✋':
            return <IconAlertTriangle size={iconSize} stroke={1.75} />;
        case '📣':
            return <IconSpeakerphone size={iconSize} stroke={1.75} />;
        case '😕':
            return <IconInfoCircle size={iconSize} stroke={1.75} />;
        default:
            return <IconSparkles size={iconSize} stroke={1.75} />;
    }
};

export const BouncingEmoji = ({emoji, size = 48}: BouncingEmojiProps) => {
    const isDanger = emoji === '✋';
    const iconSize = Math.round(size * 0.55);

    return (
        <div
            className={`${classes.wrapper} ${isDanger ? classes.dangerWrap : classes.standardWrap}`}
            style={{width: size, height: size}}
        >
            <span className={classes.iconBox}>
                {getIconForEmoji(emoji, iconSize)}
            </span>
        </div>
    );
};
