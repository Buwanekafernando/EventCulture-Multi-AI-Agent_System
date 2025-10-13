# EventCulture Startup Prompt Modifications

## Overview

The EventCulture Multi-AI-Agent System has been modified to provide user control over agent execution during server startup. Instead of automatically running the Event Collector and NLP agents, the server now prompts the user to decide whether to execute these agents.

## 🚀 New Startup Behavior

### **Interactive Startup Prompt**

When the server starts, users will see:

```
============================================================
🎭 EventCulture Multi-AI-Agent System Starting...
============================================================

🤖 Do you want to run Event Collector and NLP agents? (y/n): 
```

### **User Options**

#### **Option 1: Run Agents (y/yes)**
- ✅ Executes Event Collector agent
- ✅ Executes NLP agent for post-processing
- ✅ Shows progress messages
- ✅ Continues with server startup

#### **Option 2: Skip Agents (n/no)**
- ⏭️ Skips agent execution
- 💾 Uses existing database records
- 🚀 Server starts immediately
- 💡 Provides manual trigger options

## 🔧 Technical Implementation

### **Modified Files**

#### **1. backend/main.py**
- **Modified**: `startup_event()` function
- **Added**: Interactive prompt with user input
- **Added**: Conditional agent execution
- **Added**: Manual trigger endpoints

#### **2. frontend/src/services/api.js**
- **Added**: `triggerEventCollection()` API call
- **Added**: `triggerNLPProcessing()` API call
- **Enhanced**: `triggerAgents()` for both agents

#### **3. frontend/src/components/AdminPanel.js** (New)
- **Created**: Admin panel for manual agent control
- **Features**: Individual agent triggers, combined execution
- **UI**: User-friendly interface with status messages

#### **4. frontend/src/App.js**
- **Added**: Admin panel route (`/admin`)
- **Integration**: Protected route for authenticated users

## 🎯 New API Endpoints

### **Manual Agent Triggers**

#### **1. Trigger Both Agents**
```http
POST /trigger-agents
```
- **Purpose**: Run Event Collector + NLP Agent
- **Response**: Combined results from both agents
- **Use Case**: Complete data refresh

#### **2. Trigger Event Collector Only**
```http
POST /trigger-event-collection
```
- **Purpose**: Collect new events only
- **Response**: Event collection results
- **Use Case**: Update event database

#### **3. Trigger NLP Processing Only**
```http
POST /trigger-nlp-processing
```
- **Purpose**: Process existing events with NLP
- **Response**: NLP processing results
- **Use Case**: Enhance existing event data

## 🎨 Frontend Admin Panel

### **Features**
- **Individual Controls**: Separate buttons for each agent
- **Combined Execution**: Single button for both agents
- **Status Messages**: Real-time feedback on execution
- **Error Handling**: Graceful error display
- **Responsive Design**: Mobile-friendly interface

### **Access**
- **Route**: `/admin`
- **Authentication**: Required (ProtectedRoute)
- **Navigation**: Available in main navigation menu

## 📋 Usage Scenarios

### **Scenario 1: Fresh Installation**
1. Start server
2. Choose "y" to run agents
3. Wait for completion
4. Server ready with fresh data

### **Scenario 2: Development/Testing**
1. Start server
2. Choose "n" to skip agents
3. Server starts quickly
4. Use existing data for testing

### **Scenario 3: Manual Control**
1. Start server (skip agents)
2. Access `/admin` panel
3. Trigger agents as needed
4. Monitor execution status

### **Scenario 4: Production Deployment**
1. Start server
2. Choose "y" for initial data collection
3. Use manual triggers for updates
4. Maintain data freshness

## 🔄 Workflow Examples

### **Startup with Agent Execution**
```
🎭 EventCulture Multi-AI-Agent System Starting...
🤖 Do you want to run Event Collector and NLP agents? (y/n): y

✅ Running Event Collector and NLP agents...
📊 This may take a few minutes to collect and process events...
🔄 Starting Event Collector agent...
✅ Event collection completed: 15 events collected
🔄 Starting NLP agent for post-processing...
✅ NLP processing completed: 15 events processed
🎉 All agents completed successfully!

🚀 Server is ready to accept requests!
```

### **Startup without Agent Execution**
```
🎭 EventCulture Multi-AI-Agent System Starting...
🤖 Do you want to run Event Collector and NLP agents? (y/n): n

⏭️ Skipping agent execution. Server will start with existing database records.
💡 You can manually trigger agents later if needed.

🚀 Server is ready to accept requests!
```

## 🛠️ Error Handling

### **Input Validation**
- **Valid Responses**: 'y', 'yes', 'n', 'no' (case-insensitive)
- **Invalid Input**: Defaults to skipping agents
- **Keyboard Interrupt**: Gracefully skips agents

### **Agent Execution Errors**
- **Event Collector Failure**: Logs error, continues with NLP
- **NLP Agent Failure**: Logs error, server continues
- **Complete Failure**: Server starts with existing data

### **Manual Trigger Errors**
- **API Errors**: Displayed in admin panel
- **Network Issues**: Graceful error handling
- **Timeout Handling**: User-friendly messages

## 🚀 Benefits

### **1. User Control**
- ✅ Choose when to run resource-intensive agents
- ✅ Skip agents for quick development
- ✅ Manual control over data collection

### **2. Performance**
- ✅ Faster server startup when skipping agents
- ✅ Reduced resource usage during development
- ✅ On-demand agent execution

### **3. Flexibility**
- ✅ Development vs Production modes
- ✅ Testing with existing data
- ✅ Manual data refresh when needed

### **4. User Experience**
- ✅ Clear prompts and feedback
- ✅ Admin panel for manual control
- ✅ Status messages and error handling

## 🔧 Configuration

### **Environment Variables**
No additional environment variables required. The system uses existing configuration.

### **Database**
No database schema changes required. Uses existing models and tables.

### **Dependencies**
No new dependencies added. Uses existing FastAPI and React components.

## 📝 Testing

### **Test Script**
Run the included test script to see the new behavior:
```bash
python test_startup_prompt.py
```

### **Manual Testing**
1. Start the server: `uvicorn main:app --reload`
2. Observe the startup prompt
3. Test both "y" and "n" responses
4. Access `/admin` panel for manual triggers

## 🔮 Future Enhancements

### **Planned Features**
- **Scheduled Execution**: Cron-like agent scheduling
- **Progress Indicators**: Real-time progress bars
- **Agent Logs**: Detailed execution logs
- **Performance Metrics**: Agent execution timing

### **Advanced Options**
- **Selective Execution**: Choose specific agents
- **Background Processing**: Non-blocking execution
- **Queue Management**: Agent execution queues

## 📞 Support

For questions about the startup prompt modifications:
- Check the test script for examples
- Review the admin panel for manual control
- Examine the API endpoints for integration
- Consult the error handling for troubleshooting

---

**Built with ❤️ for EventCulture Multi-AI-Agent System**

*This modification provides flexible control over agent execution while maintaining the system's powerful AI capabilities.*
