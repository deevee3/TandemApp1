import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>) {
    return (
        <img
            {...props}
            src="/favicon-32x32.png"
            alt="Tandem"
        />
    );
}
