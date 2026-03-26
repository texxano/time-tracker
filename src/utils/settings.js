// export const BASE_URL_API = "https://texxanoapi-tst.azurewebsites.net/api/v1"
// https://texxanoapi.azurewebsites.net/api/v1 - Live 
// https://texxanoapi-tst.azurewebsites.net/api/v1  - TST
export const BASE_URL_API =  "https://texxanoapi-tst.azurewebsites.net/api/v1"
// export const BASE_URL_API =  "https://texxanoapi.azurewebsites.net/api/v1"
// export const BASE_URL_API = __DEV__ ? "https://texxanoapi-tst.azurewebsites.net/api/v1": "https://texxanoapi.azurewebsites.net/api/v1" 
// __DEV__ ? "https://texxanoapi-tst.azurewebsites.net/api/v1": "https://texxanoapi.azurewebsites.net/api/v1" 

// backend ApiKey for push data gps track
// export const ApiKey = "801E7F8B-FE25-43AD-A739-D95EAFECDBAC"
// "801E7F8B-FE25-43AD-A739-D95EAFECDBAC" // PROD
//  ApiKey: "67F89DBF-1525-43BE-A660-5FEB1BAC1F18" // TST
export const ApiKey = __DEV__ ? "67F89DBF-1525-43BE-A660-5FEB1BAC1F18": "801E7F8B-FE25-43AD-A739-D95EAFECDBAC" 
// __DEV__ ? "67F89DBF-1525-43BE-A660-5FEB1BAC1F18": "801E7F8B-FE25-43AD-A739-D95EAFECDBAC" 

// Google Auth key  
export const GoogleClientId =  '537499945259-rpfebc112o7blgme0ss48fcq7oed0ame.apps.googleusercontent.com'
export const GoogleAndroidClientId =  '885480656569-vcaqs669mjckn34aj6qt6eqe6t0k53od.apps.googleusercontent.com'
export const GoogleIOSClientId =  '885480656569-dj17esd3mc8nct6r1niei3ae6vc40gah.apps.googleusercontent.com'
export const GoogleMapsKey =  'AIzaSyCg08_nX1c9snDiLRB8vXPwLdOkZe17f3Y'

export function versionApp() {
    const date = '2024-09-20';
    // 864000000 10 Day > Status Block
    // 432000000 5 Day > Status Alert
    return new Date(date).getTime();
}

