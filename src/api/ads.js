// Mock API route to generate ads
export const getAds = (req, res) => {
    const result = {
      "ad1": "https://dummyimage.com/250x200/d6d2d6/ff0000.png&text=Ad1",
      "ad2": "https://dummyimage.com/250x200/d6d2d6/ff0000.png&text=Ad2", 
      "ad3": "https://dummyimage.com/250x200/d6d2d6/ff0000.png&text=Ad3", 
    };
    setTimeout(() => {
      res.send(result);
    }, process.env.API_DELAY);
};