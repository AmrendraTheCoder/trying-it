import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Client } from "../../types";

interface ClientCardProps {
  client: Client;
  onPress: (client: Client) => void;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onPress,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: Client["status"]) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "inactive":
        return "#9E9E9E";
      case "pending":
        return "#FF9800";
      default:
        return "#757575";
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(client)}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.email}>{client.email}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(client.status) },
          ]}
        >
          <Text style={styles.statusText}>{client.status.toUpperCase()}</Text>
        </View>
      </View>

      {client.company && <Text style={styles.company}>{client.company}</Text>}

      {client.phone && <Text style={styles.phone}>{client.phone}</Text>}

      <View style={styles.footer}>
        <Text style={styles.projectCount}>
          {client.projectCount || 0} project
          {(client.projectCount || 0) !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.lastContact}>
          Last contact:{" "}
          {client.lastContactDate
            ? new Date(client.lastContactDate).toLocaleDateString()
            : "Never"}
        </Text>
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(client)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(client)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  company: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
    fontStyle: "italic",
  },
  phone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  projectCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  lastContact: {
    fontSize: 12,
    color: "#999",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
