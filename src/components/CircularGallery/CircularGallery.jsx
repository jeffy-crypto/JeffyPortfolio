import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore"; // Import Firestore functions
import { db } from "../../firebase"; // Import your config

const CircularGallery = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "portfolio-items"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(data);
    };

    fetchProjects();
  }, []);

  return (
    <div className="gallery">
       {/* Now loop through 'projects' instead of your hardcoded JSON */}
       {projects.map(project => (
          <div key={project.id}>
             <img src={project.imageUrl} alt={project.title} />
             <h2>{project.title}</h2>
          </div>
       ))}
    </div>
  );
};

export default CircularGallery;