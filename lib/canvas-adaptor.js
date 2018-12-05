CanvasRenderingContext2D.prototype.setFillStyle = function(val) {
  this.fillStyle = val;
};

CanvasRenderingContext2D.prototype.setGlobalAlpha = function(val) {
  this.globalAlpha= val;
};

CanvasRenderingContext2D.prototype.setTextAlign = function(val) {
  this.textAlign = val;
};
// https://developers.weixin.qq.com/miniprogram/dev/api/CanvasContext.draw.html
// 将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中。
// 本次绘制是否接着上一次绘制。即 reserve 参数为 false，
// 则在本次调用绘制之前 native 层会先清空画布再继续绘制；
// 若 reserve 参数为 true，则保留当前画布上的内容，
// 本次调用 drawCanvas 绘制的内容覆盖在上面，默认 false。
CanvasRenderingContext2D.prototype.draw = function(reserve, callback) {
    callback && callback();
}
