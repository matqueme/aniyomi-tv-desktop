<template>
  <div class="tv-navigation" @keydown="handleKeyDown">
    <div class="safe-area">
      <h1 class="tv-text-xlarge">Aniyomi Tizen</h1>
      <p class="tv-text-medium">Application pour Samsung Smart TV</p>

      <div class="tv-grid">
        <button
          v-for="(item, index) in menuItems"
          :key="index"
          :ref="'menuItem' + index"
          class="focusable nav-item"
          @click="selectItem(item)"
          @focus="currentFocus = index"
        >
          {{ item.title }}
        </button>
      </div>

      <div class="device-info" v-if="deviceInfo">
        <p class="tv-text-small">
          Modèle: {{ deviceInfo.model }}<br />
          Version: {{ deviceInfo.version }}
        </p>
      </div>

      <div class="controls-help">
        <p class="tv-text-small">
          ← → ↑ ↓ Navigation | OK Sélectionner | RETURN Retour
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TvNavigation",
  data() {
    return {
      currentFocus: 0,
      deviceInfo: null,
      menuItems: [
        { title: "Anime", action: "anime" },
        { title: "Manga", action: "manga" },
        { title: "Paramètres", action: "settings" },
        { title: "À propos", action: "about" },
      ],
    };
  },
  mounted() {
    this.initializeTizen();
    this.focusCurrentItem();
  },
  methods: {
    initializeTizen() {
      if (this.$tizen && this.$tizen.isTizenDevice()) {
        this.deviceInfo = this.$tizen.getDeviceInfo();
        console.log("Tizen device detected:", this.deviceInfo);
      }
    },

    handleKeyDown(event) {
      const { keyCode } = event;

      switch (keyCode) {
        case 37: // Left
          this.navigate("left");
          event.preventDefault();
          break;
        case 38: // Up
          this.navigate("up");
          event.preventDefault();
          break;
        case 39: // Right
          this.navigate("right");
          event.preventDefault();
          break;
        case 40: // Down
          this.navigate("down");
          event.preventDefault();
          break;
        case 13: // Enter/OK
          this.selectCurrentItem();
          event.preventDefault();
          break;
        case 10009: // Return/Back
          this.goBack();
          event.preventDefault();
          break;
      }
    },

    navigate(direction) {
      const itemsPerRow = 2; // Adjust based on your grid
      const totalItems = this.menuItems.length;

      let newFocus = this.currentFocus;

      switch (direction) {
        case "left":
          newFocus =
            this.currentFocus > 0 ? this.currentFocus - 1 : totalItems - 1;
          break;
        case "right":
          newFocus = (this.currentFocus + 1) % totalItems;
          break;
        case "up":
          newFocus = this.currentFocus - itemsPerRow;
          if (newFocus < 0)
            newFocus =
              this.currentFocus +
              (Math.ceil(totalItems / itemsPerRow) - 1) * itemsPerRow;
          if (newFocus >= totalItems) newFocus = totalItems - 1;
          break;
        case "down":
          newFocus = this.currentFocus + itemsPerRow;
          if (newFocus >= totalItems)
            newFocus = this.currentFocus % itemsPerRow;
          break;
      }

      this.currentFocus = newFocus;
      this.focusCurrentItem();
    },

    focusCurrentItem() {
      this.$nextTick(() => {
        const element = this.$refs["menuItem" + this.currentFocus];
        if (element && element[0]) {
          element[0].focus();
        }
      });
    },

    selectCurrentItem() {
      const item = this.menuItems[this.currentFocus];
      this.selectItem(item);
    },

    selectItem(item) {
      console.log("Selected:", item);
      // Implement your navigation logic here
      switch (item.action) {
        case "anime":
          console.log("Opening anime section...");
          break;
        case "manga":
          console.log("Opening manga section...");
          break;
        case "settings":
          console.log("Opening settings...");
          break;
        case "about":
          console.log("Opening about...");
          break;
      }
    },

    goBack() {
      console.log("Going back...");
      if (this.$tizen && this.$tizen.isTizenDevice()) {
        this.$tizen.exitApp();
      }
    },
  },
};
</script>

<style scoped>
.tv-navigation {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-info {
  position: absolute;
  bottom: 100px;
  left: 60px;
  opacity: 0.7;
}

.controls-help {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.8;
}

.tv-grid {
  grid-template-columns: repeat(2, 1fr);
  max-width: 600px;
  margin: 40px 0;
}

button {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 20px 40px;
  font-size: 1.4em;
  border-radius: 16px;
  transition: all 0.3s ease;
}

button:focus,
button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #646cff;
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(100, 108, 255, 0.6);
}
</style>
