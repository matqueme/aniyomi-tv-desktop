// Tizen TV utilities
export class TizenTV {
  constructor() {
    this.isTizen = typeof window !== 'undefined' && window.tizen;
    this.webapis = this.isTizen ? window.webapis : null;
  }

  // Check if running on Tizen
  isTizenDevice() {
    return this.isTizen;
  }

  // Get device info
  getDeviceInfo() {
    if (!this.isTizen) return null;

    try {
      return {
        model: this.webapis.productinfo.getModel(),
        version: this.webapis.productinfo.getVersion(),
        duid: this.webapis.productinfo.getDuid(),
        resolution: this.webapis.productinfo.getResolution(),
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return null;
    }
  }

  // Handle TV key events
  setupKeyHandling() {
    if (!this.isTizen) return;

    try {
      // Register key events
      this.webapis.avplay.setListener({
        onbufferingstart: () => console.log('Buffering started'),
        onbufferingprogress: (percent) =>
          console.log('Buffering progress:', percent),
        onbufferingcomplete: () => console.log('Buffering completed'),
        onstreamcompleted: () => console.log('Stream completed'),
        oncurrentplaytime: (time) => console.log('Current play time:', time),
        onerror: (error) => console.error('AVPlay error:', error),
      });

      // Handle remote control keys
      document.addEventListener('keydown', (event) => {
        switch (event.keyCode) {
          case 37: // Left arrow
            this.handleLeft();
            break;
          case 38: // Up arrow
            this.handleUp();
            break;
          case 39: // Right arrow
            this.handleRight();
            break;
          case 40: // Down arrow
            this.handleDown();
            break;
          case 13: // Enter/OK
            this.handleEnter();
            break;
          case 10009: // Return/Back
            this.handleBack();
            break;
          case 427: // Red button
            this.handleRed();
            break;
          case 428: // Green button
            this.handleGreen();
            break;
          case 429: // Yellow button
            this.handleYellow();
            break;
          case 430: // Blue button
            this.handleBlue();
            break;
        }
      });
    } catch (error) {
      console.error('Error setting up key handling:', error);
    }
  }

  // Key handling methods (to be implemented)
  handleLeft() {
    console.log('Left key pressed');
  }
  handleUp() {
    console.log('Up key pressed');
  }
  handleRight() {
    console.log('Right key pressed');
  }
  handleDown() {
    console.log('Down key pressed');
  }
  handleEnter() {
    console.log('Enter key pressed');
  }
  handleBack() {
    console.log('Back key pressed');
  }
  handleRed() {
    console.log('Red key pressed');
  }
  handleGreen() {
    console.log('Green key pressed');
  }
  handleYellow() {
    console.log('Yellow key pressed');
  }
  handleBlue() {
    console.log('Blue key pressed');
  }

  // Exit application
  exitApp() {
    if (!this.isTizen) return;

    try {
      this.webapis.appcommon.getAppContext().exit();
    } catch (error) {
      console.error('Error exiting app:', error);
    }
  }

  // Initialize Tizen features
  init() {
    if (!this.isTizen) {
      console.log('Not running on Tizen device');
      return;
    }

    console.log('Initializing Tizen TV features...');
    this.setupKeyHandling();

    // Set up app lifecycle
    try {
      this.webapis.appcommon.getAppContext().setListener({
        onSuspend: () => console.log('App suspended'),
        onResume: () => console.log('App resumed'),
        onExit: () => console.log('App exiting'),
      });
    } catch (error) {
      console.error('Error setting up app lifecycle:', error);
    }
  }
}

// Export singleton instance
export const tizenTV = new TizenTV();
