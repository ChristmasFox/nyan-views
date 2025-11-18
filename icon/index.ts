import { ComponentType, SVGProps } from 'react';

const reqSvgs = require.context('./', false, /\.svg$/);

const icons = reqSvgs.keys().reduce((iconsMap: { [key: string]: ComponentType<SVGProps<SVGSVGElement>> }, filePath: string
) => {
  // filePath 形如 "./example.svg"，去除 "./" 和 ".svg" 得到文件名 "example"
  const fileName = filePath.replace('./', '').replace('.svg', '');
  // SVGR 转换后的组件通常为 default 导出
  iconsMap[fileName] = reqSvgs(filePath).default;

  return iconsMap;
}, {});

export default icons;
