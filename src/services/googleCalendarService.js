const { getCalendarClient, getCalendarId } = require('../config/googleApi');
const moment = require('moment');
const logger = require('../utils/logger');

// Get upcoming events
const getUpcomingEvents = async (maxResults = 5, daysAhead = 30) => {
  try {
    logger.info(`Fetching upcoming events: max ${maxResults}, ${daysAhead} days ahead`);
    
    const calendar = await getCalendarClient();
    const calendarId = getCalendarId();
    
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + daysAhead);
    
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: now.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const events = response.data.items || [];
    
    if (events.length === 0) {
      return {
        success: true,
        message: "No upcoming events found in the next " + daysAhead + " days.",
        events: []
      };
    }
    
    const formattedEvents = events.map(event => formatEvent(event));
    
    logger.info(`Found ${formattedEvents.length} upcoming events`);
    
    return {
      success: true,
      message: `Found ${formattedEvents.length} upcoming events`,
      events: formattedEvents
    };
  } catch (error) {
    logger.error('Error fetching upcoming events:', error);
    throw error;
  }
};

// Get past events
const getPastEvents = async (maxResults = 5, daysBack = 90) => {
  try {
    logger.info(`Fetching past events: max ${maxResults}, ${daysBack} days back`);
    
    const calendar = await getCalendarClient();
    const calendarId = getCalendarId();
    
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - daysBack);
    
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startDate.toISOString(),
      timeMax: now.toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const events = response.data.items || [];
    
    if (events.length === 0) {
      return {
        success: true,
        message: "No past events found in the last " + daysBack + " days.",
        events: []
      };
    }
    
    const formattedEvents = events.map(event => formatEvent(event));
    
    logger.info(`Found ${formattedEvents.length} past events`);
    
    return {
      success: true,
      message: `Found ${formattedEvents.length} past events`,
      events: formattedEvents
    };
  } catch (error) {
    logger.error('Error fetching past events:', error);
    throw error;
  }
};

// Get specific event details
const getEventDetails = async (eventId = null, eventTitle = null) => {
  try {
    const calendar = await getCalendarClient();
    const calendarId = getCalendarId();
    
    if (eventId) {
      // Get event by ID
      logger.info(`Fetching event details by ID: ${eventId}`);
      
      const response = await calendar.events.get({
        calendarId: calendarId,
        eventId: eventId
      });
      
      const event = response.data;
      const formattedEvent = formatEvent(event);
      
      return {
        success: true,
        message: "Event details retrieved successfully",
        event: formattedEvent
      };
    } else if (eventTitle) {
      // Search for event by title
      logger.info(`Searching for event by title: ${eventTitle}`);
      
      const now = new Date();
      const endDate = new Date();
      endDate.setFullYear(now.getFullYear() + 1); // Search up to 1 year ahead
      
      const response = await calendar.events.list({
        calendarId: calendarId,
        timeMin: now.toISOString(),
        timeMax: endDate.toISOString(),
        q: eventTitle,
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      const events = response.data.items || [];
      
      if (events.length === 0) {
        return {
          success: false,
          message: `No events found matching "${eventTitle}"`,
          events: []
        };
      }
      
      const formattedEvents = events.map(event => formatEvent(event));
      
      return {
        success: true,
        message: `Found ${formattedEvents.length} events matching "${eventTitle}"`,
        events: formattedEvents
      };
    } else {
      throw new Error('Either eventId or eventTitle must be provided');
    }
  } catch (error) {
    logger.error('Error fetching event details:', error);
    throw error;
  }
};

// Get events for a specific date range
const getEventsByDateRange = async (startDate, endDate, maxResults = 10) => {
  try {
    logger.info(`Fetching events from ${startDate} to ${endDate}`);
    
    const calendar = await getCalendarClient();
    const calendarId = getCalendarId();
    
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const events = response.data.items || [];
    const formattedEvents = events.map(event => formatEvent(event));
    
    return {
      success: true,
      message: `Found ${formattedEvents.length} events in the specified date range`,
      events: formattedEvents
    };
  } catch (error) {
    logger.error('Error fetching events by date range:', error);
    throw error;
  }
};

// Format event data for consistent response
const formatEvent = (event) => {
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;
  
  return {
    id: event.id,
    title: event.summary || 'Untitled Event',
    description: event.description || '',
    start: start,
    end: end,
    location: event.location || '',
    organizer: event.organizer ? event.organizer.displayName : '',
    attendees: event.attendees ? event.attendees.map(attendee => ({
      email: attendee.email,
      name: attendee.displayName || attendee.email,
      responseStatus: attendee.responseStatus
    })) : [],
    isAllDay: !event.start.dateTime,
    htmlLink: event.htmlLink,
    status: event.status,
    created: event.created,
    updated: event.updated
  };
};

// Get calendar information
const getCalendarInfo = async () => {
  try {
    const calendar = await getCalendarClient();
    const calendarId = getCalendarId();
    
    const response = await calendar.calendars.get({
      calendarId: calendarId
    });
    
    return {
      success: true,
      calendar: {
        id: response.data.id,
        summary: response.data.summary,
        description: response.data.description,
        timeZone: response.data.timeZone,
        accessRole: response.data.accessRole
      }
    };
  } catch (error) {
    logger.error('Error fetching calendar info:', error);
    throw error;
  }
};

module.exports = {
  getUpcomingEvents,
  getPastEvents,
  getEventDetails,
  getEventsByDateRange,
  getCalendarInfo,
  formatEvent
}; 