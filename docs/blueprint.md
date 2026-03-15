# **App Name**: AquaLens Pro

## Core Features:

- Water Test Input & Selection: Next.js UI for selecting test type (pH, Iron, Hardness, Chlorine) and robust mechanisms for users to capture (webcam) or upload 'before' and 'after' images of their test strips for analysis.
- AI-Powered Image Analysis API: A dedicated Flask backend API endpoint responsible for receiving test strip images. It leverages computer vision (OpenCV) for precise strip and region detection, followed by an ML-based color classifier to determine exact color changes, accurately mapping them to water quality parameters using an extensive color reference database.
- Dynamic Interpretive Results: The Next.js frontend processes data from the analysis API to display water quality levels with associated color swatches and intuitive color-coded status (safe, warning, critical). This feature includes a generative AI tool that provides tailored, scientific explanations and practical recommendations, adapting based on the analyzed results for enhanced user understanding.
- Local Session & History Tracking: Stores a comprehensive history of all conducted water quality tests locally within the user's browser (utilizing LocalStorage), allowing for easy review, retrieval, and comparison of past analyses within the current session and across visits.
- Multi-Format Data Export: Provides functionalities for users to download individual detailed test reports or their entire testing history in various user-friendly formats including TXT, JSON, and CSV. These exports are dynamically generated from the processed data.

## Style Guidelines:

- The primary background for the application shell will feature a captivating purple gradient, transitioning from #667eea to #764ba2, establishing a modern and immersive foundation.
- Main content will be presented within elegant white containers with rounded corners and shadows, ensuring clarity and focus on the data.
- Primary interactive elements and key informational highlights will utilize a deep, rich blue-purple (#5843C4) to signify scientific authority and precision, standing out on light backgrounds.
- A very subtle, light cool-grey with a hint of blue-purple hue (#F4F3F8) will be used for secondary content areas or subtle divisions within the white content panels, providing clean separation.
- A vibrant, clear cyan (#29BBE1) will serve as an accent color for calls to action, important notifications, and to evoke a sense of clarity and cleanliness.
- Headline font: 'Space Grotesk' (sans-serif) for its modern, tech-inspired feel, lending a scientific and precise character to titles and main headings.
- Body font: 'Inter' (sans-serif) for its excellent readability and neutral, objective design, ensuring clear presentation of data, explanations, and user interface text.
- Use a set of clean, minimalistic vector icons for test selections, camera/upload functions, analysis actions, and result statuses (e.g., checkmarks, exclamation marks for color-coded feedback).
- A responsive layout featuring a header, four prominent test selector buttons, a side-by-side 'Before/After' image card display, a central 'Analyze' button, and a collapsible/expandable session history section. Results will be presented in a tabbed area (Results, Statistics, History), optimized for mobile and desktop.
- Implement subtle loading animations for the analysis process, smooth transitions between different test sections, and elegant hover effects for buttons to enhance user feedback and overall dynamism.