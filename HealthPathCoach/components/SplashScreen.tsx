import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
    isLoading?: boolean;
}

export default function SplashScreen({ onFinish, isLoading = true }: SplashScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Simulate loading progress
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 9000,
            useNativeDriver: false,
        }).start();

        // Auto-finish after 9.5 seconds regardless of loading state
        const timer = setTimeout(() => {
            onFinish();
        }, 9500);

        return () => clearTimeout(timer);
    }, [isLoading]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <LinearGradient
            colors={['#ffffff', '#f8f9fa', '#e9ecef']}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* App Name */}
                <Text style={styles.appName}>HealthPathCoach</Text>
                <Text style={styles.tagline}>Your Personal Health Companion</Text>

                {/* Loading Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                { width: progressWidth },
                            ]}
                        />
                    </View>
                    <Text style={styles.loadingText}>
                        {isLoading ? 'Loading your health journey...' : 'Ready!'}
                    </Text>
                </View>

                {/* Health Icons */}
                <View style={styles.healthIcons}>
                    <Image
                        source={require('../assets/images/menstrual-health.png')}
                        style={styles.healthIcon}
                    />
                    <Image
                        source={require('../assets/images/nutrition.png')}
                        style={styles.healthIcon}
                    />
                    <Image
                        source={require('../assets/images/mental-wellness.png')}
                        style={styles.healthIcon}
                    />
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 20,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 40,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    progressContainer: {
        width: width * 0.7,
        marginBottom: 40,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#ecf0f1',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#008080',
        borderRadius: 2,
    },
    loadingText: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
    },
    healthIcons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    healthIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        opacity: 0.6,
    },
}); 