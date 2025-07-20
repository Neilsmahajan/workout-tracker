# 💪 Workout Tracker

A modern, cross-platform workout tracking mobile app built with React Native and Expo. Track your workouts, monitor your progress, and stay motivated on your fitness journey.

## 📱 Features

- **Create Custom Workouts**: Design personalized workout routines with multiple exercises
- **Track Sets & Reps**: Record weight, reps, and sets for each exercise
- **Workout History**: View your complete workout history with detailed statistics
- **Progress Monitoring**: Track your fitness journey over time
- **Cross-Platform**: Works on both iOS and Android devices
- **Offline-First**: All data is stored locally on your device
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🛠️ Tech Stack

- **Framework**: React Native 0.79.5 with Expo 53
- **Navigation**: Expo Router with file-based routing
- **Storage**: AsyncStorage for local data persistence
- **Icons**: Lucide React Native icons
- **Language**: TypeScript for type safety
- **Styling**: React Native StyleSheet

## 📦 Dependencies

### Core

- React 19.0.0
- React Native 0.79.5
- Expo SDK 53
- TypeScript 5.8.3

### Navigation & UI

- Expo Router 5.1.2
- React Navigation (Bottom Tabs)
- Lucide React Native (Icons)
- React Native Gesture Handler
- React Native Reanimated

### Storage & Utilities

- AsyncStorage 2.1.2
- React Native Safe Area Context

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/workout-tracker.git
   cd workout-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Run on your device**
   - Install the Expo Go app on your phone
   - Scan the QR code displayed in the terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

## 📱 App Structure

```
app/
├── (tabs)/               # Tab-based navigation
│   ├── index.tsx        # Home/Workouts screen
│   ├── history.tsx      # Workout history
│   └── profile.tsx      # User profile
├── exercise/            # Exercise management
│   └── [...params].tsx  # Dynamic exercise routes
├── workout/             # Workout details
│   └── [id].tsx        # Individual workout view
└── _layout.tsx         # Root layout

components/
├── DumbbellIcon.tsx    # Custom dumbbell icon

types/
└── workout.ts          # TypeScript interfaces

utils/
└── storage.ts          # Local storage utilities
```

## 💾 Data Model

The app uses a simple, efficient data structure:

```typescript
interface Workout {
  id: string;
  name: string;
  date?: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  date?: string;
  sets: WorkoutSet[];
}

interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
}
```

## 🔧 Available Scripts

- `npm run dev` - Start the development server
- `npm run lint` - Run ESLint

## 📸 Screenshots

_Coming soon - screenshots will be added once the app is finalized_

## 🚧 Roadmap

- [ ] Exercise templates and library
- [ ] Workout statistics and analytics
- [ ] Progress photos
- [ ] Social sharing features
- [ ] Backup and sync functionality
- [ ] Rest timer functionality
- [ ] Exercise instructions and animations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Neil Mahajan**

- Email: neilsmahajan@gmail.com
- GitHub: [@neilsmahajan](https://github.com/neilsmahajan)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Inspired by the fitness community

---

**Happy Lifting! 🏋️‍♂️**

_Stay consistent, track your progress, and achieve your fitness goals with Workout Tracker._
