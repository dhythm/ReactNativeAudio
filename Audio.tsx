import React, { useEffect, useState } from 'react';
import { Button, Platform, View } from 'react-native';
import { AudioRecorder, AudioUtils } from 'react-native-audio';

const Audio: React.FunctionComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(null);
  const [hasPermission, setHasPermission] = useState<boolean>(null);
  const [currentTime, setCurrentTime] = useState(null);

  const prepareRecordingPath = (path: string) => {
    AudioRecorder.prepareRecordingAtPath(path, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: 'Low',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 32000,
    });
  };

  const path = `${AudioUtils.DocumentDirectoryPath}/test.aac`;

  useEffect(() => {
    AudioRecorder.requestAuthorization().then((isAuthorized) => {
      setHasPermission(isAuthorized);

      if (!isAuthorized) {
        return;
      }

      prepareRecordingPath(path);

      AudioRecorder.onProgress = (data) => {
        setCurrentTime(Math.floor(data.currentTime));
      };

      AudioRecorder.onFinished = (data) => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === 'ios') {
          console.log({ ...data });
        }
      };
    });
  }, [path]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title={isRecording ? 'pause' : isPaused ? 'resume' : 'start'}
        onPress={async () => {
          if (!hasPermission) {
            console.warn("Can't record, no permission granted!");
            return;
          }

          try {
            if (isRecording) {
              const filePath = await AudioRecorder.pauseRecording();
              prepareRecordingPath(path);
              setIsRecording(false);
              setIsPaused(true);
              console.log({ filePath });
              return;
            }

            if (!isPaused) {
              prepareRecordingPath(path);
            }

            const filePath = isPaused
              ? await AudioRecorder.resumeRecording()
              : await AudioRecorder.startRecording();
            console.log({ filePath });

            setIsRecording(true);
          } catch (e) {
            console.log({ e });
            return;
          }
        }}
      />
      <Button
        title="stop"
        onPress={async () => {
          if (!hasPermission) {
            console.warn("Can't record, no permission granted!");
            return;
          }

          if (!isRecording && !setIsPaused) {
            console.warn("Can't stop, not recording!");
            return;
          }

          setIsRecording(false);
          setIsPaused(false);

          try {
            const filePath = await AudioRecorder.stopRecording();
            console.log({ currentTime, filePath });
          } catch (e) {
            console.log({ e });
          }
        }}
      />
    </View>
  );
};

export default Audio;
