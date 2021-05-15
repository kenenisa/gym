const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    inputBg:"rgba(0,0,0,0.035)",
    inputBorder:"rgba(0,0,0,0.035)",
    inputColor:'black',
    listBorder:'#ddd',
    fadedText:'#ddd',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    inputBg:"rgba(255,255,255,0.9)",
    inputBorder:"rgba(255,255,255,0.8)",
    inputColor:'white',
    listBorder:'red',
    fadedText:'#aaa',
  },
};
