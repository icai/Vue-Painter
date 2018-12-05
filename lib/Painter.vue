
<template>
  <canvas :id="canvasid" :width="canvasWidthInPx" :height="canvasHeightInPx" :style="customStyle"></canvas>
</template>
<script>
import util from "./util";
import Pen from './pen'
const downloader = {
  download: function(url) {
    return new Promise((resolve, reject) => {
      if (util.isColor(url)) {
          resolve(url);
          return;
      }
      var viewImg = new Image();
      viewImg.setAttribute("crossOrigin",'Anonymous')
      viewImg.onload = function() {
        const rw = viewImg.naturalWidth;
        const rh = viewImg.naturalHeight;
        resolve(viewImg);
      };
      viewImg.src = url;
    });
  }
};
let screenK = 0.5;
screenK = window.innerWidth / 750;
String.prototype.toPx = function toPx(minus) {
  let reg;
  if (minus) {
    reg = /^-?[0-9]+([.]{1}[0-9]+){0,1}(rpx|px)$/g;
  } else {
    reg = /^[0-9]+([.]{1}[0-9]+){0,1}(rpx|px)$/g;
  }
  const results = reg.exec(this);
  if (!this || !results) {
    console.error(`The size: ${this} is illegal`);
    return 0;
  }
  const unit = results[2];
  const value = parseFloat(this);

  let res = 0;
  if (unit === 'rpx') {
    res = Math.round(value * screenK);
  } else if (unit === 'px') {
    res = value;
  }
  return res;
};
export default {
  name: "painter",
  props: {
    autoDownload: {
      type: Boolean,
      value: false
    },
    customStyle: {
      type: String
    },
    preProcess: {
      type: Function,
      default:() =>{}
    },
    palette: Object,
    // 启用脏检查，默认 false
    dirty: {
      type: Boolean,
      value: false
    }
  },
  data() {
    return {
      canvasWidthInPx: 0,
      canvasHeightInPx: 0,
      paintCount: 0,
      canvasid: util.random("c"),
      picURL: "",
      showCanvas: true,
      painterStyle: ""
    };
  },
  watch: {
    palette: function(newVal, oldVal) {
      if (this.isNeedRefresh(newVal, oldVal)) {
        this.paintCount = 0;
        this.startPaint();
      }
    }
  },
  mounted() {
    this.startPaint();
  },
  methods: {
    /**
     * 判断一个 object 是否为 空
     * @param {object} object
     */
    isEmpty(object) {
      for (const i in object) {
        return false;
      }
      return true;
    },

    isNeedRefresh(newVal, oldVal) {
      if (
        !newVal ||
        this.isEmpty(newVal) ||
        (this.dirty && util.equal(newVal, oldVal))
      ) {
        return false;
      }
      return true;
    },
    startPaint() {
      const me = this;
      if (this.isEmpty(this.palette)) {
        return;
      }
      screenK = window.innerWidth / 750;
      this.downloadImages().then(palette => {
        const { width, height } = palette;
        this.canvasWidthInPx = width.toPx();
        this.canvasHeightInPx = height.toPx();
        if (!width || !height) {
          console.error(
            `You should set width and height correctly for painter, width: ${width}, height: ${height}`
          );
          return;
        }
        var canvas = document.getElementById(this.canvasid);
        canvas.width = this.canvasWidthInPx;
        canvas.height = this.canvasHeightInPx;
        // document.body.appendChild(canvas);
        var ctx = canvas.getContext("2d");
        const pen = new Pen(ctx, palette);
        pen.onpreProcess = function(obj, callback) {
          me.preProcess(obj, callback);
        };
        pen.paint(() => {
          this.autoDownload && this.saveImgToLocal();
        });
      });
    },
    downloadImages: function() {
      const palette = this.palette;
      return new Promise((resolve, reject) => {
        let preCount = 0;
        let completeCount = 0;
        const paletteCopy = JSON.parse(JSON.stringify(palette));
        if (paletteCopy.background) {
          preCount++;
          downloader.download(paletteCopy.background).then(
            path => {
              paletteCopy.background = path;
              completeCount++;
              if (preCount === completeCount) {
                resolve(paletteCopy);
              }
            },
            () => {
              completeCount++;
              if (preCount === completeCount) {
                resolve(paletteCopy);
              }
            }
          );
        }
        if (paletteCopy.views) {
          for (const view of paletteCopy.views) {
            if (view && view.type === "image" && view.url) {
              preCount++;
              /* eslint-disable no-loop-func */
              downloader.download(view.url).then(
                path => {
                  view.url = path;
                  // 获得一下图片信息，供后续裁减使用
                  view.sWidth = path.width;
                  view.sHeight = path.height;
                  completeCount++;
                  if (preCount === completeCount) {
                    resolve(paletteCopy);
                  }
                },
                () => {
                  completeCount++;
                  if (preCount === completeCount) {
                    resolve(paletteCopy);
                  }
                }
              );
            }
          }
        }
        if (preCount === 0) {
          resolve(paletteCopy);
        }
      });
    },
    saveImgToLocal() {
      var a = document.createElement("a");
      var canvas = document.getElementById(this.canvasid);
      var s = canvas.toDataURL("image/png");
      a.href = s;
      a.download = 'draw_' + parseInt(Math.random() * 10e5)+ '.png';
      a.click();
    }
  }
};
</script>

