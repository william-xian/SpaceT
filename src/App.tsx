import './App.css';
import React from 'react';
import SpaceScene from './SpaceScene';
import { C } from './C';
import { SelectPicker, Slider, Input } from 'rsuite';

const bodies = [
  { label: "太阳", value: '1' },
  { label: "水星", value: '1-1' },
  { label: "金星", value: '1-2' },
  { label: "地球", value: '1-3' },
  { label: "月球", value: '1-3-1' },
  { label: "火星", value: '1-4' },
  { label: "木星", value: '1-5' },
  { label: "土星", value: '1-6' },
  { label: "天王星", value: '1-7' },
  { label: "海王星", value: '1-8' },
];
class App extends React.Component {
  state = {
    timeUnit: 1
  }
  scene: SpaceScene | null = null;
  componentDidMount() {
    this.scene = new SpaceScene();
  }
  render() {
    return (
      <div>
        <div id="scene" ></div>
        <div className='app-settings'>
          <label>时间速率(帧*天)</label>
          <Slider defaultValue={1e3} min={1} max={1e4} onChange={(v: number) => {
            C.TIME_UNIT = 8.64 * v;
          }} />
          <br />
          <label>[日,行,卫]半径放大系数</label>
          <Input defaultValue="[10,200,10]" onChange={(val) => {
            C.fRadius = JSON.parse(val);
          }} 
          onPressEnter={(evt) => {
            this.scene?.updateFRadius();
          }} />
          <br />
          <label>所处位置</label>
          <SelectPicker defaultValue='1' data={bodies} onChange={(v:string) => {
            this.scene?.updateCamera(v);
          }}/>
          <br />
        </div>
      </div>
    );
  }
}

export default App;
