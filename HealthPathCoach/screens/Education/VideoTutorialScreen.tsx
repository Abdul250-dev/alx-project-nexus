import { useNavigation, useRoute } from "@react-navigation/native"
import { VideoView, useVideoPlayer } from "expo-video"
import React, { useEffect, useState } from "react"
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { FileText, Maximize2, Pause, Play, SkipBack, SkipForward, Volume2 } from "react-native-feather"
import Header from "../../components/Header"
import { useTheme } from "../../components/theme-provider"
import { t } from "../../services/localizationService"

const { width } = Dimensions.get("window")

// Move styles to a function that takes colors as a parameter
const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  videoSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  videoContainer: {
    width: width - 32,
    height: (width - 32) * (9 / 16),
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  videoControls: {
    position: "absolute",
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -20 }],
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButton: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
    marginHorizontal: 8,
  },
  playButton: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 50,
    marginHorizontal: 16,
  },
  additionalControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
  },
  additionalControlButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    marginLeft: 8,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    padding: 20,
  },
  videoTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 32,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructor: {
    fontSize: 16,
    fontWeight: '600',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginHorizontal: 12,
  },
  duration: {
    fontSize: 14,
    fontWeight: '500',
  },
  videoDescription: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  transcriptSection: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transcriptTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transcriptTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  transcriptToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
  },
  transcriptToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transcriptScroll: {
    maxHeight: 200,
    borderRadius: 12,
    padding: 16,
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
})

export default function VideoTutorialScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { topicId } = route.params as { topicId: string }

  const [videoInfo, setVideoInfo] = useState<any>(null)
  const [showFullTranscript, setShowFullTranscript] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Create video player using the new expo-video API
  const player = useVideoPlayer(videoInfo?.source, (player) => {
    player.loop = false
    player.muted = false
  })

  useEffect(() => {
    // In a real app, this would fetch from an API or database
    // For now, we'll use mock data
    const mockVideoInfo = {
      id: topicId,
      title: "Tracking Your Fertility Signs",
      description:
        "This video explains how to identify and track fertility signs throughout your menstrual cycle to better understand your reproductive health.",
      source: require("../../assets/videos/sample-video.mp4"),
      duration: "8:45",
      instructor: "Dr. Sarah Johnson",
      transcript:
        "Welcome to this educational video on tracking your fertility signs. Understanding your body's fertility signs can help you identify your fertile window, whether you're trying to conceive or avoid pregnancy naturally.\n\nThere are three primary fertility signs you can track: cervical mucus changes, basal body temperature, and cervical position. Let's discuss each one.\n\nFirst, cervical mucus. Throughout your cycle, your cervical mucus changes in response to hormonal fluctuations. After your period, you might notice little to no mucus, or it may be sticky and thick. As you approach ovulation, the mucus becomes increasingly wet, slippery, and stretchy, similar to raw egg whites. This 'fertile-quality' mucus helps sperm travel through the reproductive tract and indicates your most fertile days. After ovulation, the mucus becomes thicker or disappears.\n\nSecond, basal body temperature or BBT. This is your body's temperature at complete rest. To track BBT, take your temperature first thing in the morning before getting out of bed, using a special basal thermometer that measures to the hundredth of a degree. Before ovulation, your BBT is typically lower. After ovulation, progesterone causes your temperature to rise by about 0.2 to 0.5 degrees Celsius (0.4 to 1.0 degrees Fahrenheit) and stay elevated until your next period. A sustained temperature rise confirms that ovulation has occurred.\n\nThird, cervical position. The position and feel of your cervix (the lower part of the uterus that extends into the vagina) changes throughout your cycle. During your fertile window, the cervix rises higher in the vagina, becomes softer (like your lips), more open, and wetter. After ovulation, it becomes lower, firmer (like the tip of your nose), closed, and drier.\n\nTo effectively track these signs, maintain a daily record using a paper chart, app, or the HealthPath Coach tracking feature. Note the characteristics of your cervical mucus, your basal body temperature, and optionally, your cervical position. Over time, you'll start to recognize patterns in your cycle.\n\nRemember that stress, illness, travel, and lifestyle changes can affect these fertility signs. It's also important to note that while fertility awareness methods can be effective for family planning when used correctly, they require consistent tracking and understanding of your unique cycle patterns.\n\nIf you notice unusual changes in your fertility signs or have concerns about your reproductive health, consult with a healthcare provider.\n\nThank you for watching this educational video on tracking your fertility signs. With practice and consistency, you can become more attuned to your body's natural rhythms and take charge of your reproductive health.",
    }

    setVideoInfo(mockVideoInfo)
    setIsLoading(false)
  }, [topicId])

  const handlePlayPause = () => {
    if (player.playing) {
      player.pause()
    } else {
      player.play()
    }
  }

  const handleRewind = () => {
    const currentTime = player.currentTime || 0
    player.seekTo(Math.max(0, currentTime - 10))
  }

  const handleForward = () => {
    const currentTime = player.currentTime || 0
    const duration = player.duration || 0
    player.seekTo(Math.min(duration, currentTime + 10))
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const toggleControls = () => {
    setShowControls(!showControls)
  }

  if (isLoading) {
    return (
      <View style={[getStyles(colors).container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <Header title={t('common.loading')} showBackButton />
        <View style={getStyles(colors).loadingContainer}>
          <Text style={[getStyles(colors).loadingText, { color: colors.white }]}>
            {t('common.loading')}...
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[getStyles(colors).container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Header title={t('education.video')} showBackButton />

      <ScrollView
        contentContainerStyle={getStyles(colors).scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Player Section */}
        <View style={getStyles(colors).videoSection}>
          <TouchableOpacity
            style={getStyles(colors).videoContainer}
            onPress={toggleControls}
            activeOpacity={1}
          >
            <VideoView
              style={getStyles(colors).video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />

            {/* Video Overlay Gradient */}
            <View style={getStyles(colors).videoOverlay} />

            {/* Video Controls */}
            {showControls && (
              <>
                <View style={getStyles(colors).videoControls}>
                  <TouchableOpacity onPress={handleRewind} style={getStyles(colors).controlButton}>
                    <SkipBack stroke={colors.white} width={28} height={28} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handlePlayPause} style={getStyles(colors).playButton}>
                    {player.playing ? (
                      <Pause stroke={colors.white} width={32} height={32} />
                    ) : (
                      <Play stroke={colors.white} width={32} height={32} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleForward} style={getStyles(colors).controlButton}>
                    <SkipForward stroke={colors.white} width={28} height={28} />
                  </TouchableOpacity>
                </View>

                {/* Additional Controls */}
                <View style={getStyles(colors).additionalControls}>
                  <TouchableOpacity style={getStyles(colors).additionalControlButton}>
                    <Volume2 stroke={colors.white} width={20} height={20} />
                  </TouchableOpacity>
                  <TouchableOpacity style={getStyles(colors).additionalControlButton}>
                    <Maximize2 stroke={colors.white} width={20} height={20} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Progress Bar */}
            <View style={getStyles(colors).progressContainer}>
              <View style={[getStyles(colors).progressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                <View
                  style={[
                    getStyles(colors).progressFill,
                    {
                      backgroundColor: colors.teal,
                      width: player.duration ? `${(player.currentTime / player.duration) * 100}%` : "0%",
                    },
                  ]}
                />
              </View>
              <View style={getStyles(colors).timeContainer}>
                <Text style={[getStyles(colors).timeText, { color: colors.white }]}>
                  {player.currentTime ? formatTime(player.currentTime) : "0:00"}
                </Text>
                <Text style={[getStyles(colors).timeText, { color: colors.white }]}>
                  {player.duration ? formatTime(player.duration) : videoInfo.duration}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Video Information */}
        <View style={getStyles(colors).infoSection}>
          <Text style={[getStyles(colors).videoTitle, { color: colors.white }]}>
            {videoInfo.title}
          </Text>

          <View style={getStyles(colors).metaInfo}>
            <Text style={[getStyles(colors).instructor, { color: colors.teal }]}>
              {videoInfo.instructor}
            </Text>
            <View style={getStyles(colors).metaDot} />
            <Text style={[getStyles(colors).duration, { color: colors.lightGray }]}>
              {videoInfo.duration}
            </Text>
          </View>

          <Text style={[getStyles(colors).videoDescription, { color: colors.lightGray }]}>
            {videoInfo.description}
          </Text>
        </View>

        {/* Transcript Section */}
        <View style={[getStyles(colors).transcriptSection, { backgroundColor: colors.navyBlue }]}>
          <View style={getStyles(colors).transcriptHeader}>
            <View style={getStyles(colors).transcriptTitleContainer}>
              <FileText stroke={colors.teal} width={20} height={20} />
              <Text style={[getStyles(colors).transcriptTitle, { color: colors.white }]}>
                {t('education.transcript')}
              </Text>
            </View>
            <TouchableOpacity
              style={[getStyles(colors).transcriptToggleButton, { borderColor: colors.teal }]}
              onPress={() => setShowFullTranscript((prev) => !prev)}
            >
              <Text style={[getStyles(colors).transcriptToggleText, { color: colors.teal }]}>
                {showFullTranscript ? t('common.show_less') || 'Show less' : t('common.show_more') || 'Show more'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={[
              getStyles(colors).transcriptScroll,
              { backgroundColor: 'rgba(255,255,255,0.05)' },
              showFullTranscript && { maxHeight: undefined }
            ]}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[getStyles(colors).transcriptText, { color: colors.lightGray }]}>
              {videoInfo.transcript}
            </Text>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  )
}