import Constants from "expo-constants";
import React from "react";
import { Platform, View } from "react-native";

const isExpoGo = Constants.appOwnership === "expo";

let BannerAdComponent: any = null;
let BannerAdSize: any = null;

if (!isExpoGo && Platform.OS !== "web") {
  try {
    const ads = require("react-native-google-mobile-ads");
    BannerAdComponent = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
  } catch (_) {}
}

const ANDROID_BANNER_ID = "ca-app-pub-4197232545307197/9022553476";
const IOS_BANNER_ID = "ca-app-pub-4197232545307197/9022553476";

const TEST_ANDROID_ID = "ca-app-pub-3940256099942544/6300978111";
const TEST_IOS_ID = "ca-app-pub-3940256099942544/2934735716";

function getAdUnitId() {
  const isDev = __DEV__;
  if (isDev) {
    return Platform.OS === "ios" ? TEST_IOS_ID : TEST_ANDROID_ID;
  }
  return Platform.OS === "ios" ? IOS_BANNER_ID : ANDROID_BANNER_ID;
}

export function AdBanner() {
  if (isExpoGo || Platform.OS === "web" || !BannerAdComponent) {
    return null;
  }

  return (
    <View style={{ alignItems: "center", width: "100%" }}>
      <BannerAdComponent
        unitId={getAdUnitId()}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
