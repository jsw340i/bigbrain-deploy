# UI/UX Improvements

I've implemented several key UI/UX features to improve the user experience:

1. **Lobby Room**:  
   A lobby screen is provided for players who are waiting for the host to start the quiz session. It features a dynamic message that changes when the session is started, giving the player an indication of the session status. This is also stated in the spec under 2.6.1.

2. **Main Alerts**:  
   I've used alerts to provide real-time feedback to users when critical actions are performed. For example, when a player successfully answers a question or when there is an error with their action (e.g., invalid answer submission or API failures), a corresponding alert is shown. These alerts are designed to be clear and informative, guiding the user through what happened and what they should do next. This helps in creating an interactive and responsive experience.

3. **Go Back Buttons**:  
   To ensure smooth navigation, I've added "Go Back" buttons at the top of every page. This allows users to easily return to the previous page, minimizing confusion and providing a sense of control. This feature is especially important in longer flows where users may want to revisit previous screens without having to reload the page or lose their progress.

4. **Player-Friendly Question Flow**:  
   The quiz flow is designed to be intuitive. Players can easily navigate through questions, answer them, and see the results in a clear and structured format. The interface gives players clear feedback about their answers, including whether their answer was correct and how much time is left for the current question. This ensures that players know exactly where they are in the quiz and what they need to do next.

5. **Responsive Design**:  
   The design has been optimized for both mobile and desktop views, ensuring that the application is accessible and usable across different screen sizes. This responsive layout ensures that players have a consistent and smooth experience regardless of their device.

These design choices aim to improve usability and ensure that users feel confident and in control while interacting with the application.
