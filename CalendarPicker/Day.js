import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';

export default function Day(props) {
  const {
    day,
    month,
    year,
    styles,
    customDatesStyles,
    onPressDay,
    selectedStartDate,
    selectedEndDate,
    allowRangeSelection,
    allowBackwardRangeSelect,
    selectedDayStyle: propSelectedDayStyle,
    selectedDisabledDatesTextStyle,
    selectedRangeStartStyle,
    selectedRangeStyle,
    selectedRangeEndStyle,
    textStyle,
    todayTextStyle,
    selectedDayTextStyle: propSelectedDayTextStyle,
    selectedRangeStartTextStyle,
    selectedRangeEndTextStyle,
    minDate,
    maxDate,
    disabledDates,
    disabledDatesTextStyle,
    minRangeDuration,
    maxRangeDuration,
    enableDateChange
  } = props;

  const thisDay = moment({year, month, day, hour: 12 });
  const today = moment();

  let dateOutOfRange;
  let selectedDayContainerStyle = styles.dayButton; // may be overridden depending on state
  let selectedDayTextStyle = {};
  let selectedDayStyle;
  let overrideOutOfRangeTextStyle;
  let dateIsBeforeMin = false;
  let dateIsAfterMax = false;
  let dateIsDisabled = false;
  let dateRangeLessThanMin = false;
  let dateRangeGreaterThanMax = false;
  let customContainerStyle, customDateStyle, customTextStyle;

  // First let's check if date is out of range
  // Check whether props maxDate / minDate are defined. If not supplied,
  // don't restrict dates.
  if (maxDate) {
    dateIsAfterMax = thisDay.isAfter(maxDate, 'day');
  }
  if (minDate) {
    dateIsBeforeMin = thisDay.isBefore(minDate, 'day');
  }

  if (disabledDates) {
    if (Array.isArray(disabledDates) && disabledDates.indexOf(thisDay.valueOf()) >= 0) {
      dateIsDisabled = true;
    }
    else if (disabledDates instanceof Function) {
      dateIsDisabled = disabledDates(thisDay);
    }
  }

  if (allowRangeSelection && selectedStartDate && !selectedEndDate) {
    let daysDiff = thisDay.diff(selectedStartDate, 'days'); // may be + or -
    daysDiff = allowBackwardRangeSelect ? Math.abs(daysDiff) : daysDiff;

    if (maxRangeDuration) {
      if (Array.isArray(maxRangeDuration)) {
        let maxRangeEntry = maxRangeDuration.find(mrd => selectedStartDate.isSame(mrd.date, 'day') );
        if (maxRangeEntry && daysDiff > maxRangeEntry.maxDuration) {
          dateRangeGreaterThanMax = true;
        }
      } else if(daysDiff > maxRangeDuration) {
        dateRangeGreaterThanMax = true;
      }
    }

    if (minRangeDuration) {
      if (Array.isArray(minRangeDuration)) {
        let minRangeEntry = minRangeDuration.find(mrd => selectedStartDate.isSame(mrd.date, 'day') );
        if (minRangeEntry && daysDiff < minRangeEntry.minDuration) {
          dateRangeLessThanMin = true;
        }
      } else if(daysDiff < minRangeDuration) {
        dateRangeLessThanMin = true;
      }
    }

    if (!allowBackwardRangeSelect && daysDiff < 0) {
      dateRangeLessThanMin = true;
    }
  }

  dateOutOfRange = dateIsAfterMax || dateIsBeforeMin || dateIsDisabled || dateRangeLessThanMin || dateRangeGreaterThanMax;

  let isThisDaySameAsSelectedStart = thisDay.isSame(selectedStartDate, 'day');
  let isThisDaySameAsSelectedEnd = thisDay.isSame(selectedEndDate, 'day');
  let isThisDateInSelectedRange =
    selectedStartDate
    && selectedEndDate
    && thisDay.isBetween(selectedStartDate, selectedEndDate,'day','[]');

  // If date is in range let's apply styles
  if (!dateOutOfRange || isThisDaySameAsSelectedStart || isThisDaySameAsSelectedEnd || isThisDateInSelectedRange) {
    // set today's style
    let isToday = thisDay.isSame(today, 'day');
    if (isToday) {
      selectedDayContainerStyle = styles.selectedToday;
      // todayTextStyle prop overrides selectedDayTextColor (created via makeStyles)
      selectedDayTextStyle = [todayTextStyle || styles.selectedDayLabel, propSelectedDayTextStyle];
    }

    if (Array.isArray(customDatesStyles)) {
      for (let cds of customDatesStyles) {
        if (thisDay.isSame(moment(cds.date), 'day')) {
          customContainerStyle = cds.containerStyle;
          customDateStyle = cds.style;
          customTextStyle = cds.textStyle;
          break;
        }
      }
    }
    else if (customDatesStyles instanceof Function) {
      let cds = customDatesStyles(thisDay) || {};
      customContainerStyle = cds.containerStyle;
      customDateStyle = cds.style;
      customTextStyle = cds.textStyle;
    }
    if (isToday && customDateStyle) {
      // Custom date style overrides 'today' style. It may be reset below
      // by date selection styling.
      selectedDayContainerStyle = [styles.selectedToday, customDateStyle];
    }

    // set selected day style
    if (!allowRangeSelection &&
        selectedStartDate &&
        isThisDaySameAsSelectedStart)
    {
      selectedDayContainerStyle = styles.selectedDay;
      selectedDayTextStyle = [styles.selectedDayLabel, isToday && todayTextStyle, propSelectedDayTextStyle];
      // selectedDayStyle prop overrides selectedDayColor (created via makeStyles)
      selectedDayStyle = propSelectedDayStyle || styles.selectedDayBackground;
    }

    // Set selected ranges styles
    if (allowRangeSelection) {
      if (selectedStartDate && selectedEndDate) {
        // Apply style for start date
        if (isThisDaySameAsSelectedStart) {
          selectedDayContainerStyle = [styles.startDayWrapper, selectedRangeStyle, selectedRangeStartStyle];
          selectedDayTextStyle = [styles.selectedDayLabel, propSelectedDayTextStyle, selectedRangeStartTextStyle];
        }
        // Apply style for end date
        if (isThisDaySameAsSelectedEnd) {
          selectedDayContainerStyle = [styles.endDayWrapper, selectedRangeStyle, selectedRangeEndStyle];
          selectedDayTextStyle = [styles.selectedDayLabel, propSelectedDayTextStyle, selectedRangeEndTextStyle];
        }
        // Apply style if start date is the same as end date
        if (isThisDaySameAsSelectedEnd &&
            isThisDaySameAsSelectedStart &&
            selectedEndDate.isSame(selectedStartDate, 'day'))
        {
          selectedDayContainerStyle = [styles.selectedDay, styles.selectedDayBackground, selectedRangeStyle];
          selectedDayTextStyle = [styles.selectedDayLabel, propSelectedDayTextStyle, selectedRangeStartTextStyle];
        }
        // Apply style for days inside of range, excluding start & end dates.
        if (thisDay.isBetween(selectedStartDate, selectedEndDate, 'day', '()')) {
          selectedDayContainerStyle = [styles.inRangeDay, selectedRangeStyle];
          selectedDayTextStyle = [styles.selectedDayLabel, propSelectedDayTextStyle];
        }
      }
      // Apply style if start date has been selected but end date has not
      if (selectedStartDate &&
          !selectedEndDate &&
          isThisDaySameAsSelectedStart)
      {
        selectedDayContainerStyle = [styles.startDayWrapper, selectedRangeStyle, selectedRangeStartStyle];
        selectedDayTextStyle = [styles.selectedDayLabel, propSelectedDayTextStyle, selectedRangeStartTextStyle];
        // Override out of range start day text style when minRangeDuration = 1.
        // This allows selected start date's text to be styled by selectedRangeStartTextStyle
        // even when it's below minRangeDuration.
        overrideOutOfRangeTextStyle = selectedRangeStartTextStyle;
      }
    }

    if (dateOutOfRange) { // selected start or end date, but not selectable now
      return (
        <View style={[styles.dayWrapper, customContainerStyle]}>
          <View style={[customDateStyle, selectedDayContainerStyle, selectedDayStyle ]}>
            <Text style={[styles.dayLabel, textStyle,
              styles.disabledText, disabledDatesTextStyle,
              styles.selectedDisabledText, selectedDisabledDatesTextStyle,
              overrideOutOfRangeTextStyle
            ]}>
              { day }
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={[styles.dayWrapper, customContainerStyle]}>
          <TouchableOpacity
            disabled={!enableDateChange}
            style={[customDateStyle, selectedDayContainerStyle, selectedDayStyle ]}
            onPress={() => onPressDay({year, month, day}) }>
            <Text style={[styles.dayLabel, textStyle, customTextStyle, selectedDayTextStyle]}>
              { day }
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
  else {  // dateOutOfRange = true but not selected start or end date
    return (
      <View style={styles.dayWrapper}>
        <Text style={[textStyle, styles.disabledText, disabledDatesTextStyle]}>
          { day }
        </Text>
      </View>
    );
  }
}

Day.defaultProps = {
  customDatesStyles: [],
};

Day.propTypes = {
  styles: PropTypes.shape({}),
  day: PropTypes.number,
  onPressDay: PropTypes.func,
  disabledDates: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  minRangeDuration: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
  maxRangeDuration: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
};