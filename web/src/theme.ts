import { theme } from 'antd';

export const appTheme = {
    algorithm: theme.defaultAlgorithm,
    token: {
        colorPrimary: '#402FFF',
        colorError: '#EC1D35',
        colorBgLayout: '#EDEDED',
        colorTextBase: '#1B1C21',
        fontFamily: "'JetBrains Mono', monospace",
    },
    components: {
        Layout: {
            headerBg: '#1B1C21',
            headerColor: '#EDEDED',
            footerBg: '#1B1C21',
            footerColor: '#C8C9CA',
        },
        Menu: {
            itemColor: '#C8C9CA',
            itemSelectedColor: '#402FFF',
            itemSelectedBg: 'rgba(64, 47, 255, 0.1)',
        },
        Button: {
            fontFamily: "'JetBrains Mono', monospace",
        }
    }
};