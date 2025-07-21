const { getSheetsClient, getSheetId } = require('../config/googleApi');
const logger = require('../utils/logger');

// Get FAQs from Google Sheets
const getFAQs = async (category = null, searchTerm = null) => {
  try {
    logger.info(`Fetching FAQs - category: ${category}, search: ${searchTerm}`);
    
    const sheets = await getSheetsClient();
    const sheetId = getSheetId();
    
    // Assuming FAQ sheet has columns: Category, Question, Answer, Tags
    const range = 'FAQs!A:D'; // Adjust range based on your sheet structure
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range
    });
    
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return {
        success: true,
        message: "No FAQs found in the database.",
        faqs: []
      };
    }
    
    // Skip header row and parse data
    const headers = rows[0];
    const faqData = rows.slice(1).map(row => {
      const faq = {};
      headers.forEach((header, index) => {
        faq[header.toLowerCase()] = row[index] || '';
      });
      return faq;
    });
    
    // Filter by category if specified
    let filteredFAQs = faqData;
    if (category) {
      filteredFAQs = faqData.filter(faq => 
        faq.category && faq.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Filter by search term if specified
    if (searchTerm) {
      filteredFAQs = filteredFAQs.filter(faq =>
        (faq.question && faq.question.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (faq.answer && faq.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (faq.tags && faq.tags.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filteredFAQs.length === 0) {
      return {
        success: true,
        message: `No FAQs found matching the criteria.`,
        faqs: []
      };
    }
    
    logger.info(`Found ${filteredFAQs.length} FAQs`);
    
    return {
      success: true,
      message: `Found ${filteredFAQs.length} FAQs`,
      faqs: filteredFAQs
    };
  } catch (error) {
    logger.error('Error fetching FAQs:', error);
    throw error;
  }
};

// Get speaker information from Google Sheets
const getSpeakerInfo = async (speakerName = null, eventId = null) => {
  try {
    logger.info(`Fetching speaker info - name: ${speakerName}, event: ${eventId}`);
    
    const sheets = await getSheetsClient();
    const sheetId = getSheetId();
    
    // Assuming Speakers sheet has columns: Name, Bio, Expertise, Contact, Events, Social
    const range = 'Speakers!A:F'; // Adjust range based on your sheet structure
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range
    });
    
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return {
        success: true,
        message: "No speaker information found in the database.",
        speakers: []
      };
    }
    
    // Skip header row and parse data
    const headers = rows[0];
    const speakerData = rows.slice(1).map(row => {
      const speaker = {};
      headers.forEach((header, index) => {
        speaker[header.toLowerCase()] = row[index] || '';
      });
      return speaker;
    });
    
    // Filter by speaker name if specified
    let filteredSpeakers = speakerData;
    if (speakerName) {
      filteredSpeakers = speakerData.filter(speaker =>
        speaker.name && speaker.name.toLowerCase().includes(speakerName.toLowerCase())
      );
    }
    
    // Filter by event if specified
    if (eventId) {
      filteredSpeakers = filteredSpeakers.filter(speaker =>
        speaker.events && speaker.events.includes(eventId)
      );
    }
    
    if (filteredSpeakers.length === 0) {
      return {
        success: true,
        message: `No speakers found matching the criteria.`,
        speakers: []
      };
    }
    
    logger.info(`Found ${filteredSpeakers.length} speakers`);
    
    return {
      success: true,
      message: `Found ${filteredSpeakers.length} speakers`,
      speakers: filteredSpeakers
    };
  } catch (error) {
    logger.error('Error fetching speaker info:', error);
    throw error;
  }
};

// Get community resources from Google Sheets
const getCommunityResources = async (category = null) => {
  try {
    logger.info(`Fetching community resources - category: ${category}`);
    
    const sheets = await getSheetsClient();
    const sheetId = getSheetId();
    
    // Assuming Resources sheet has columns: Category, Title, Description, Link, Type
    const range = 'Resources!A:E'; // Adjust range based on your sheet structure
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range
    });
    
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return {
        success: true,
        message: "No community resources found in the database.",
        resources: []
      };
    }
    
    // Skip header row and parse data
    const headers = rows[0];
    const resourceData = rows.slice(1).map(row => {
      const resource = {};
      headers.forEach((header, index) => {
        resource[header.toLowerCase()] = row[index] || '';
      });
      return resource;
    });
    
    // Filter by category if specified
    let filteredResources = resourceData;
    if (category) {
      filteredResources = resourceData.filter(resource =>
        resource.category && resource.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (filteredResources.length === 0) {
      return {
        success: true,
        message: `No resources found in category: ${category}`,
        resources: []
      };
    }
    
    logger.info(`Found ${filteredResources.length} community resources`);
    
    return {
      success: true,
      message: `Found ${filteredResources.length} community resources`,
      resources: filteredResources
    };
  } catch (error) {
    logger.error('Error fetching community resources:', error);
    throw error;
  }
};

// Get event feedback/surveys from Google Sheets
const getEventFeedback = async (eventId = null) => {
  try {
    logger.info(`Fetching event feedback - event: ${eventId}`);
    
    const sheets = await getSheetsClient();
    const sheetId = getSheetId();
    
    // Assuming Feedback sheet has columns: EventID, Rating, Comments, Date, Attendee
    const range = 'Feedback!A:E'; // Adjust range based on your sheet structure
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range
    });
    
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return {
        success: true,
        message: "No feedback found in the database.",
        feedback: []
      };
    }
    
    // Skip header row and parse data
    const headers = rows[0];
    const feedbackData = rows.slice(1).map(row => {
      const feedback = {};
      headers.forEach((header, index) => {
        feedback[header.toLowerCase()] = row[index] || '';
      });
      return feedback;
    });
    
    // Filter by event ID if specified
    let filteredFeedback = feedbackData;
    if (eventId) {
      filteredFeedback = feedbackData.filter(feedback =>
        feedback.eventid && feedback.eventid === eventId
      );
    }
    
    if (filteredFeedback.length === 0) {
      return {
        success: true,
        message: `No feedback found for the specified event.`,
        feedback: []
      };
    }
    
    logger.info(`Found ${filteredFeedback.length} feedback entries`);
    
    return {
      success: true,
      message: `Found ${filteredFeedback.length} feedback entries`,
      feedback: filteredFeedback
    };
  } catch (error) {
    logger.error('Error fetching event feedback:', error);
    throw error;
  }
};

// Get sheet metadata
const getSheetInfo = async () => {
  try {
    const sheets = await getSheetsClient();
    const sheetId = getSheetId();
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId
    });
    
    const sheetInfo = response.data.sheets.map(sheet => ({
      title: sheet.properties.title,
      sheetId: sheet.properties.sheetId,
      index: sheet.properties.index
    }));
    
    return {
      success: true,
      spreadsheet: {
        title: response.data.properties.title,
        sheets: sheetInfo
      }
    };
  } catch (error) {
    logger.error('Error fetching sheet info:', error);
    throw error;
  }
};

module.exports = {
  getFAQs,
  getSpeakerInfo,
  getCommunityResources,
  getEventFeedback,
  getSheetInfo
}; 