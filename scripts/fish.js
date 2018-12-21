class Fish {

   constructor(x, y, scale) {
      this.scale = scale || 1;
      this.x = x || 0;
      this.y = y || 0;
      this.w = 80 * this.scale;
      this.h = 40 * this.scale;
   }

   drawFish(ctx, color = "black") {
      if (!ctx) {
         throw "ERROR: Canvas context not defined";
      }

      const tailWidth = (20 * this.scale),
         bodyWidth = (80 * this.scale),
         tailHeight = (40 * this.scale),
         tailMid = (20 * this.scale);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(tailWidth, tailMid - (5 * this.scale));
      ctx.lineTo(tailHeight, 0);
      ctx.bezierCurveTo(bodyWidth, 0, bodyWidth, tailHeight, tailHeight, tailHeight);
      ctx.lineTo(tailWidth, tailMid + (5 * this.scale));
      ctx.lineTo(0, tailHeight);
      ctx.lineTo(0, 0);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#444444";
      ctx.stroke();
   }

   contains(mx, my) {
      // All we have to do is make sure the Mouse X,Y fall in the area between
      // the shape's X and (X + Width) and its Y and (Y + Height)
      // console.log(`Mouse: ${mx}, ${my}`);
      // console.log(`This x and y: ${this.x}, ${this.y}`);
      // console.log(`This w and h: ${this.w}, ${this.h}`);
      
      return (this.x <= mx) && (this.x + this.w >= mx) &&
         (this.y <= my) && (this.y + this.h >= my);
   }
}