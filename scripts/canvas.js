class CanvasState {
   constructor(canvas) {
      // **** First some setup! ****

      this.canvas = canvas;
      this.setWidthAndHeight();

      this.ctx = canvas.getContext('2d');
      const fish = new Fish(0, 0, 1);
      fish.drawFish(this.ctx, "blue");
      // This complicates things a little but but fixes mouse co-ordinate problems
      // when there's a border or padding. See getMouse for more detail
      var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
      if (document.defaultView && document.defaultView.getComputedStyle) {
         this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
         this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
         this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
         this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
      }
      // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
      // They will mess up mouse coordinates and this fixes that
      var html = document.body.parentNode;
      this.htmlTop = html.offsetTop;
      this.htmlLeft = html.offsetLeft;

      // **** Keep track of state! ****

      this.valid = false; // when set to false, the canvas will redraw everything
      this.fishes = []; // the collection of fishes to be drawn
      this.fishes.push(fish);
      this.dragging = false; // Keep track of when we are dragging
      // the current selected object. In the future we could turn this into an array for multiple selection
      this.selection = null;
      this.dragoffx = 0; // See mousedown and mousemove events for explanation
      this.dragoffy = 0;

      // **** Then events! ****

      // This is an example of a closure!
      // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
      // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
      // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
      // This is our reference!
      var myState = this;
      console.dir(canvas);


      //fixes a problem where double clicking causes text to get selected on the canvas
      canvas.addEventListener('selectstart', function (e) {
         e.preventDefault();
         return false;
      }, false);
      // Up, down, and move are for dragging
      canvas.addEventListener('mousedown', function (e) {
         var mouse = myState.getMouse(e);
         var mx = mouse.x;
         var my = mouse.y;

         const fishes = myState.fishes;
         for (let i = fishes.length - 1; i >= 0; i--) {
            if (fishes[i].contains(mx, my)) {
               console.log("Clicked insied the fish");

               const mySel = fishes[i];
               // Keep track of where in the object we clicked
               // so we can move it smoothly (see mousemove)
               myState.dragoffx = mx - mySel.x;
               myState.dragoffy = my - mySel.y;
               myState.dragging = true;
               myState.selection = mySel;
               myState.valid = false;
               return;
            }
         }
         // havent returned means we have failed to select anything.
         // If there was an object selected, we deselect it
         if (myState.selection) {
            myState.selection = null;
            myState.valid = false; // Need to clear the old selection border
         }
      }, true);
      canvas.addEventListener('mousemove', function (e) {
         if (myState.dragging) {
            var mouse = myState.getMouse(e);
            // We don't want to drag the object by its top-left corner, we want to drag it
            // from where we clicked. Thats why we saved the offset and use it here
            myState.selection.x = mouse.x - myState.dragoffx;
            myState.selection.y = mouse.y - myState.dragoffy;
            myState.valid = false; // Something's dragging so we must redraw
         }
      }, true);
      canvas.addEventListener('mouseup', function (e) {
         myState.dragging = false;
      }, true);
      // double click for making new shapes
      canvas.addEventListener('dblclick', function (e) {
         var mouse = myState.getMouse(e);
         myState.addFish(new Fish(mouse.x - 10, mouse.y - 10, 1));
      }, true);
   }

   setWidthAndHeight() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
   }

   addFish(fish) {
      this.fishes.push(fish);
      this.valid = false;
   }

   draw() {
      // if our state is invalid, redraw and validate!
      if (!this.valid) {
         const ctx = this.ctx;
         const fishes = this.fishes;
         this.clear();

         // ** Add stuff you want drawn in the background all the time here **

         // draw all shapes
         for (var i = 0; i < fishes.length; i++) {
            console.log("Drawing all the fishes");
            
            var shape = fishes[i];
            // We can skip the drawing of elements that have moved off the screen:
            if (shape.x > this.width || shape.y > this.height ||
               shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
            fishes[i].drawFish(this.ctx, color);
         }

         // draw selection
         // right now this is just a stroke along the edge of the selected Shape
         if (this.selection != null) {
            this.ctx.strokeStyle = this.selectionColor;
            this.ctx.lineWidth = this.selectionWidth;
            var mySel = this.selection;
            ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
         }

         // ** Add stuff you want drawn on top all the time here **

         this.valid = true;
      }
   }

   // Creates an object with x and y defined, set to the mouse position relative to the state's canvas
   // If you wanna be super-correct this can be tricky, we have to worry about padding and borders
   getMouse(e) {
      var element = this.canvas,
         offsetX = 0,
         offsetY = 0,
         mx, my;

      // Compute the total offset
      if (element.offsetParent !== undefined) {
         do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
         } while ((element = element.offsetParent));
      }

      // Add padding and border style widths to offset
      // Also add the <html> offsets in case there's a position:fixed bar
      offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
      offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

      mx = e.pageX - offsetX;
      my = e.pageY - offsetY;

      // We return a simple javascript object (a hash) with x and y defined
      return {
         x: mx,
         y: my
      };
   }
}

window.onload = () => {
   const canvas = new CanvasState(document.getElementsByTagName("canvas")[0]);
}