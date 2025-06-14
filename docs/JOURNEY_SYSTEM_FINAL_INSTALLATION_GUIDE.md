# Journey System Final Installation Guide

This document provides a comprehensive guide to installing and deploying the Journey System.

## Prerequisites

Before installing the Journey System, ensure you have the following:

1. **Supabase Account**: You need a Supabase account to host the database
2. **Node.js**: Version 14 or higher
3. **npm**: Version 6 or higher
4. **Git**: For version control

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/your-repo.git
cd your-repo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase

1. Create a new Supabase project
2. Copy your Supabase URL and API key
3. Create a `.env` file in the root directory with the following content:

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-api-key
```

### 4. Make Scripts Executable

```bash
cd supabase
chmod +x make_all_scripts_executable.sh
./make_all_scripts_executable.sh
```

### 5. Apply Journey System Changes

```bash
./apply_all_journey_system_changes.sh
```

This will:
- Apply the journey integration system
- Apply sample data
- Update the UI components

### 6. Start the Development Server

```bash
cd ..
npm run dev
```

## Deployment Steps

### 1. Build the Application

```bash
npm run build
```

### 2. Deploy to Your Hosting Provider

Deploy the built application to your hosting provider of choice (e.g., Netlify, Vercel, AWS, etc.).

### 3. Configure Environment Variables

Configure the following environment variables on your hosting provider:

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-api-key
```

## Database Migration

The Journey System includes a migration script that:

1. Creates default journey phases
2. Migrates steps from the old `steps` table to the new `journey_steps` table
3. Migrates progress from the old `company_journey_steps` table to the new `step_progress` table
4. Migrates relationships from the old `step_relationships` table to the new tables

This migration is automatically applied when you run the `apply_journey_integration.sh` script.

## Sample Data

The Journey System includes sample data for:

1. Journey phases
2. Journey steps
3. Expert recommendations
4. Template recommendations
5. Peer insights

This sample data is automatically applied when you run the `apply_journey_sample_data.sh` script.

## Troubleshooting

### Common Issues

1. **Scripts not executable**: Make sure you've run `chmod +x make_all_scripts_executable.sh` and `./make_all_scripts_executable.sh`
2. **Database connection issues**: Check your Supabase URL and API key in the `.env` file
3. **Migration errors**: Check the Supabase console for any error messages
4. **UI not updating**: Make sure you've run `npm run dev` to start the development server

### Getting Help

If you encounter any issues during installation or deployment, please:

1. Check the documentation
2. Look for error messages in the console
3. Contact the development team for support

## Next Steps

After installing the Journey System, you should:

1. Customize the journey phases and steps for your specific needs
2. Add your own expert recommendations
3. Create your own templates
4. Collect peer insights from your community

## Conclusion

The Journey System is now installed and ready to use. You can access it at `http://localhost:3000` (or your deployed URL) and start guiding startup founders through the process of building a successful startup.

For more information on how to use the Journey System, please refer to the [Journey System User Guide](JOURNEY_SYSTEM_USER_GUIDE.md).
