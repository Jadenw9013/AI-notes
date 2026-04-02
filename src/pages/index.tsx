import dynamic from "next/dynamic";
import Head from "next/head";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const Editor = dynamic(() => import("../../components/Editor"), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Notes - Intelligent Note Taking</title>
        <meta name="description" content="A professional AI-powered note taking application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="app-layout">
        <Sidebar />
        
        <main className="main-content">
          <Header />
          
          <div className="editor-container">
            <h1 className="editor-title">Untitled Document</h1>
            <div className="editor-meta">
              <span>Last edited just now</span>
            </div>
            <Editor />
          </div>
        </main>
      </div>
    </>
  );
}
