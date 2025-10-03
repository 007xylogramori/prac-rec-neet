# MongoDB Setup for Zenith World

This application now uses MongoDB as the database to store test results instead of local storage.

## Setup Instructions

### 1. Install MongoDB

#### Option A: Local MongoDB Installation
- **macOS**: `brew install mongodb-community`
- **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- **Linux**: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your MongoDB URI:
   ```env
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017/zenith-world
   
   # For MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zenith-world
   ```

### 3. Start the Application

1. Make sure MongoDB is running (if using local installation)
2. Start the development server:
   ```bash
   npm run dev
   ```

## Database Structure

The application uses the following MongoDB collections:

### TestRecord Collection
- **id**: Unique identifier (UUID)
- **subject**: Physics, Chemistry, or Biology
- **questionCount**: Number of questions in the test
- **questions**: Array of question entries with status
- **dateISO**: ISO timestamp of when the test was saved
- **score**: Total score using NEET scoring system
- **correct**: Number of correct answers
- **wrong**: Number of wrong answers
- **notAttempted**: Number of unattempted questions
- **byChapter**: Statistics broken down by chapter
- **createdAt**: MongoDB timestamp
- **updatedAt**: MongoDB timestamp

## API Endpoints

The following API endpoints are available:

- `GET /api/tests` - Get all test records
- `GET /api/tests/:id` - Get a specific test record
- `POST /api/tests` - Create a new test record
- `PUT /api/tests/:id` - Update a test record
- `DELETE /api/tests/:id` - Delete a specific test record
- `DELETE /api/tests` - Delete all test records
- `GET /api/tests/stats/summary` - Get test statistics summary

## Migration from Local Storage

The application has been updated to use the database instead of local storage. All existing functionality remains the same, but data is now persisted in MongoDB.

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running (if using local installation)
- Check that the MongoDB URI in `.env` is correct
- Verify network connectivity (for Atlas)

### Data Not Loading
- Check browser console for API errors
- Verify database connection in server logs
- Ensure the database and collection exist

### Performance
- The application includes database indexes for optimal query performance
- Consider using MongoDB Atlas for production deployments
