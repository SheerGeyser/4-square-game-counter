import { setWakeUpRelaunch } from "@zos/display";

App({
  globalData: {},
  onCreate(options) {
    console.log("app on create invoke");
    /** После гашения экрана мини‑программа по умолчанию может закрыться; при пробуждении снова открыть это приложение (не циферблат). */
    setWakeUpRelaunch(true);
  },

  onDestroy(options) {
    console.log("app on destroy invoke");
  },
});
