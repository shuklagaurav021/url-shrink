const getOsFromUserAgent = (userAgent) => {
    if (/windows nt 10.0/i.test(userAgent)) {
      return "Windows 10";
    } else if (/windows nt 6.1/i.test(userAgent)) {
      return "Windows 7";
    } else if (/mac os x/i.test(userAgent)) {
      return "Mac OS";
    } else if (/linux/i.test(userAgent)) {
      return "Linux";
    } else if (/android/i.test(userAgent)) {
      return "Android";
    } else if (/iphone|ipod/i.test(userAgent)) {
      return "iOS";
    } else if (/ipad/i.test(userAgent)) {
      return "iPadOS";
    } else if (/like mac os x/i.test(userAgent)) {
      return "iOS";
    } else {
      return "Unknown OS";
    }
  };
  
  const getDeviceFromUserAgent = (userAgent) => {
    if (/mobile/i.test(userAgent)) {
      return "Mobile";
    } else if (/tablet/i.test(userAgent)) {
      return "Tablet";
    } else if (/desktop/i.test(userAgent) || !/mobile|tablet/i.test(userAgent)) {
      return "Desktop";
    } else {
      return "Unknown Device";
    }
  };
  