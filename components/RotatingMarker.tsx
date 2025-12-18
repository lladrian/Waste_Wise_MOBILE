// // RotatingMarker.js
// import React, { useState, useEffect } from 'react';
// import { Marker, Image } from 'react-native-maps';

// const RotatingMarker = ({ 
//   coordinate, 
//   title, 
//   description, 
//   onPress, 
//   rotation = 0, 
//   imageSource 
// }) => {
//   const [rotationStyle, setRotationStyle] = useState({ transform: [{ rotate: '0deg' }] });

//   useEffect(() => {
//     // Update rotation when prop changes
//     setRotationStyle({ transform: [{ rotate: `${rotation}deg` }] });
//   }, [rotation]);

//   return (
//     <Marker
//       coordinate={coordinate}
//       title={title}
//       description={description}
//       onPress={onPress}
//       anchor={{ x: 0.5, y: 0.5 }} // Center the rotation
//       tracksViewChanges={false} // Add for better performance
//     >
//       <Image 
//         source={imageSource} 
//         style={[
//           { 
//             width: 40, 
//             height: 40,
//             resizeMode: 'contain' // Add this for proper image scaling
//           }, 
//           rotationStyle
//         ]} 
//       />
//     </Marker>
//   );
// };

// export default RotatingMarker;