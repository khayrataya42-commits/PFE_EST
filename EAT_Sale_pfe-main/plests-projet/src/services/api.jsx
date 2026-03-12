import axios from "axios";

// =========================
// AUTH / KEYCLOAK
// =========================

export const apiAuth = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Login via Keycloak
export const login = async (username, password) => {
  try {
    const body = new URLSearchParams();
    body.append("client_id", "frontend-client");
    body.append("grant_type", "password");
    body.append("username", username);
    body.append("password", password);

    const response = await axios.post(
      "http://localhost:8080/realms/est-sale/protocol/openid-connect/token",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la connexion", error);
    throw error;
  }
};

// Refresh token via Keycloak
export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("Aucun refresh token trouvé.");

  try {
    const body = new URLSearchParams();
    body.append("client_id", "frontend-client");
    body.append("grant_type", "refresh_token");
    body.append("refresh_token", refresh);

    const response = await axios.post(
      "http://localhost:8080/realms/est-sale/protocol/openid-connect/token",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    localStorage.setItem("token", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token :", error);
    throw error;
  }
};

// =========================
// UPLOAD MICROSERVICE
// =========================

export const apiUpload = axios.create({
  baseURL: import.meta.env.VITE_API_UPLOAD,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadFile = (file, token, courseId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("course_id", courseId);

  return apiUpload.post("/files/uploadfile/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createEvent = (eventData, token) => {
  return apiUpload.post("/api/calendar", eventData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

apiUpload.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiUpload(originalRequest);
      } catch (refreshError) {
        console.error(
          "Erreur pendant le rafraîchissement du token :",
          refreshError
        );
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// =========================
// IMPORT MICROSERVICE
// =========================

export const apiImport = axios.create({
  baseURL: import.meta.env.VITE_API_IMPORT,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getFile_teacher = (token) => {
  return apiImport.get(`/files/professors/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getEvent_teacher = (user_id, token) => {
  return apiImport.get(`/calendar/professor/${user_id}/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCourses_teacher = (token) => {
  return apiImport.get(`/courses/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const get_teacher_by_department = (department, token) => {
  return apiImport
    .get(`/teachers/list/${department}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des professeurs:", error);
      throw error;
    });
};

export const get_courses_admin = (token) => {
  return apiImport.get(`/courses/admin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const get_students_admin = async (token) => {
  return await apiImport.get(`/student/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const get_students_semestre_admin = async (token) => {
  return await apiImport.get(`/student/list/students-with-semesters`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const get_users_admin = (token) => {
  return apiImport.get(`/users/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const get_users = async (token) => {
  try {
    const response = await apiImport.get(`/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données utilisateur:", error);
    throw error;
  }
};

export const get_files_courses_students = (token) => {
  return apiImport.get(`/students/me/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const downloadFile = async (fileId, fileName, token) => {
  try {
    const response = await apiImport.get(
      `/students/me/files/${fileId}/${fileName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );

    const link = document.createElement("a");
    const url = window.URL.createObjectURL(new Blob([response.data]));
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("❌ Erreur lors du téléchargement du fichier : ", error);
  }
};

export const getStudentEvents = async (token) => {
  try {
    const response = await apiImport.get("/calendar/etudiant/events", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des événements :", error);
    throw error;
  }
};

export const getStudentNotifs = async (token) => {
  try {
    const response = await apiImport.get("/notifications/etudiant", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications :", error);
    throw error;
  }
};

export const markAsRead = async (notificationId, token) => {
  try {
    const response = await apiImport.patch(
      `/notifications/${notificationId}/read`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification :", error);
    throw error;
  }
};

apiImport.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiImport(originalRequest);
      } catch (refreshError) {
        console.error("Erreur lors du rafraîchissement du token", refreshError);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// =========================
// ADMIN MICROSERVICE
// =========================

export const apiAdmin = axios.create({
  baseURL: "http://127.0.0.1:8003",
  headers: {
    "Content-Type": "application/json",
  },
});

export const deleted_cours_admin = (course_id, token) => {
  return apiAdmin.delete(`/admin/courses/${course_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const add_cours_admin = (data, token) => {
  return apiAdmin
    .post("admin/courses", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Cours ajouté avec succès:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Erreur lors de l'ajout du cours:", error);
      throw error;
    });
};

export const deleted_student_admin = (student_id, semester, token) => {
  return apiAdmin
    .delete(`/admin/enrollments/${student_id}/${semester}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Étudiant supprimé avec succès:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression de l'étudiant:", error);
      throw error;
    });
};

export const add_student_admin = (data, token) => {
  return apiAdmin
    .post("/admin/enrollments", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Étudiant ajouté avec succès:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Erreur lors de l'ajout de l'étudiant:", error);
      throw error;
    });
};

export const deleted_users_admin = (user_id, token) => {
  return apiAdmin
    .delete(`/admin/users/${user_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Utilisateur supprimé avec succès:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      throw error;
    });
};

export const add_users_admin = (data, token) => {
  return apiAdmin
    .post(`/admin/users`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Utilisateur ajouté avec succès:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error);
      throw error;
    });
};
export const createRegistrationRequest = async (data) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8003/registration-requests",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de la demande d'inscription:",
      error.response?.data || error
    );
    throw error;
  }
};

export const getRegistrationRequests = async () => {
  try {
    const response = await apiAdmin.get("/registration-requests");
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des demandes:", error);
    throw error;
  }
};

export const approveRegistrationRequest = async (requestId, token) => {
  try {
    const response = await apiAdmin.post(
      `/registration-requests/${requestId}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'approbation de la demande:", error);
    throw error;
  }
};

export const rejectRegistrationRequest = async (requestId, token) => {
  try {
    const response = await apiAdmin.post(
      `/registration-requests/${requestId}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors du rejet de la demande:", error);
    throw error;
  }
};
export const createPasswordResetRequest = async (data) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/password-reset-requests",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de la demande de réinitialisation :",
      error.response?.data || error
    );
    throw error;
  }
};
export const getPasswordResetRequests = async () => {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8003/password-reset-requests"
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors du chargement des demandes de reset password :",
      error.response?.data || error
    );
    throw error;
  }
};
export const approvePasswordResetRequest = async (requestId) => {
  try {
    const response = await axios.post(
      `http://127.0.0.1:8000/password-reset-requests/${requestId}/approve`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de l'approbation de la demande de reset password :",
      error.response?.data || error
    );
    throw error;
  }
};

export const rejectPasswordResetRequest = async (requestId) => {
  try {
    const response = await axios.post(
      `http://127.0.0.1:8000/password-reset-requests/${requestId}/reject`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors du refus de la demande de reset password :",
      error.response?.data || error
    );
    throw error;
  }
};