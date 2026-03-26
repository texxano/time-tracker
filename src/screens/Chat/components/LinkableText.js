import React from 'react';
import { Text, Linking, Alert, View } from 'react-native';

// Regular expression to detect URLs
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;

const LinkableText = ({ children, style, ...props }) => {
  if (!children || typeof children !== 'string') {
    return <Text style={style} {...props}>{children}</Text>;
  }

  const text = children;
  const parts = [];
  let lastIndex = 0;
  let match;

  // Reset regex index
  URL_REGEX.lastIndex = 0;

  // Find all URLs in the text
  while ((match = URL_REGEX.exec(text)) !== null) {
    const url = match[0];
    const index = match.index;

    // Add text before the URL
    if (index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, index),
      });
    }

    // Add the URL
    parts.push({
      type: 'link',
      content: url,
    });

    lastIndex = index + url.length;
  }

  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  // If no URLs found, return plain text
  if (parts.length === 0) {
    return <Text style={style} {...props}>{text}</Text>;
  }

  const handlePress = async (url) => {
    try {
      // Add https:// if URL doesn't start with http:// or https://
      let fullUrl = url;
      if (!url.match(/^https?:\/\//i)) {
        fullUrl = `https://${url}`;
      }

      // Check if the URL can be opened
      const supported = await Linking.canOpenURL(fullUrl);

      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert('Error', `Cannot open this URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link. Please try again.');
    }
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {parts.map((part, index) => {
        if (part.type === 'link') {
          return (
            <Text
              key={index}
              style={[
                style,
                {
                  color: '#3b82f6',
                  textDecorationLine: 'underline',
                }
              ]}
              onPress={() => handlePress(part.content)}
            >
              {part.content}
            </Text>
          );
        }
        return <Text key={index} style={style}>{part.content}</Text>;
      })}
    </View>
  );
};

export default LinkableText;

