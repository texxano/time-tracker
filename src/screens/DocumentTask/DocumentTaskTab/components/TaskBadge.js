import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormattedMessage } from 'react-intl';

const TaskBadge = ({ isInProgress, isOverdue, isDuedateSoon, isNew, data }) => {
  return (
    <View style={styles.badgeContainer}>
      {isInProgress && !data.isCompleted && (
        <View style={[styles.badge, styles.yellow]}>
          <Text style={styles.text}><FormattedMessage id="money-tracker.payment.status.label.in-progress" /></Text>
        </View>
      )}
      {isOverdue && !data.isCompleted && (
        <View style={[styles.badge, styles.red]}>
          <Text style={styles.text}><FormattedMessage id="document.task.status.overdue" /></Text>
        </View>
      )}
      {isDuedateSoon && !data.isCompleted && (
        <View style={[styles.badge, styles.redYellow]}>
          <Text style={styles.text}><FormattedMessage id="document.task.status.overdue.soon" /></Text>
        </View>
      )}
      {isNew && !data.isCompleted && !isOverdue && (
        <View style={[styles.badge, styles.new]}>
          <Text style={styles.text}><FormattedMessage id="projects.form.status.new" /></Text>
        </View>
      )}
      {data.isCompleted && (
        <View style={[styles.badge, styles.green]}>
          <Text style={styles.text}><FormattedMessage id="Complete.Step.Task.Button" /></Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,

  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
    marginRight: 10,
  },
  red: {
    backgroundColor: '#f76d81',
  },
  yellow: {
    backgroundColor: '#ffd331',
  },
  green: {
    backgroundColor: '#28a745',
  },
  new: {
    backgroundColor: '#cde7ff',
  },
  redYellow: {
    backgroundColor: '#f74b34',
  },
  text: {
    fontSize: 15,
    color: "#fff"
  }
});

export default TaskBadge;
