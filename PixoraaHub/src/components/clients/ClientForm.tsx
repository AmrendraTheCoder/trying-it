import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Client } from "../../types";

interface ClientFormProps {
  client?: Client; // If provided, we're editing; if not, we're creating
  onSubmit: (
    clientData: Omit<Client, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes: string;
  status: Client["status"];
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: "",
    status: "active",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Populate form if editing
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || "",
        company: client.company || "",
        address: client.address || "",
        notes: client.notes || "",
        status: client.status,
      });
    }
  }, [client]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate phone (optional but if provided, should be reasonable)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = formData.phone.replace(/[-\s\(\)]/g, "");
      if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before submitting."
      );
      return;
    }

    const submitData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      company: formData.company.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    onSubmit(submitData);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const StatusSelector: React.FC = () => (
    <View style={styles.statusContainer}>
      <Text style={styles.label}>Status</Text>
      <View style={styles.statusButtons}>
        {(["active", "inactive", "pending"] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              formData.status === status && styles.statusButtonSelected,
            ]}
            onPress={() => updateField("status", status)}
          >
            <Text
              style={[
                styles.statusButtonText,
                formData.status === status && styles.statusButtonTextSelected,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {client ? "Edit Client" : "Add New Client"}
        </Text>

        {/* Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(value) => updateField("name", value)}
            placeholder="Enter client name"
            autoCapitalize="words"
            editable={!loading}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(value) => updateField("email", value)}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Phone Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={formData.phone}
            onChangeText={(value) => updateField("phone", value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            editable={!loading}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Company Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Company</Text>
          <TextInput
            style={styles.input}
            value={formData.company}
            onChangeText={(value) => updateField("company", value)}
            placeholder="Enter company name"
            autoCapitalize="words"
            editable={!loading}
          />
        </View>

        {/* Address Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(value) => updateField("address", value)}
            placeholder="Enter address"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* Status Selector */}
        <StatusSelector />

        {/* Notes Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => updateField("notes", value)}
            placeholder="Enter any additional notes..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Saving..." : client ? "Update" : "Create"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "#f44336",
    backgroundColor: "#fff5f5",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#f44336",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusButtons: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  statusButtonSelected: {
    backgroundColor: "#2196F3",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  statusButtonTextSelected: {
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
