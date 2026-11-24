import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

# Many-to-many relationship table between Collections and Documents
collection_documents = Table(
    'collection_documents',
    Base.metadata,
    Column('collection_id', String, ForeignKey('collections.id', ondelete='CASCADE'), primary_key=True),
    Column('document_id', String, ForeignKey('documents.id', ondelete='CASCADE'), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    organization = Column(String, default='Enterprise Client')
    role = Column(String, default='Analyst')
    department = Column(String, default='Operations')
    avatar_url = Column(String, nullable=True)
    plan = Column(String, default='Enterprise')  # Free, Professional, Enterprise
    two_factor_enabled = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    documents = relationship('Document', back_populates='owner', cascade='all, delete-orphan')
    collections = relationship('Collection', back_populates='owner', cascade='all, delete-orphan')
    conversations = relationship('Conversation', back_populates='user', cascade='all, delete-orphan')
    activity_logs = relationship('ActivityLog', back_populates='user', cascade='all, delete-orphan')
    api_keys = relationship('ApiKey', back_populates='user', cascade='all, delete-orphan')
    sessions = relationship('UserSession', back_populates='user', cascade='all, delete-orphan')

class Document(Base):
    __tablename__ = 'documents'

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = Column(String, nullable=False, index=True)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False, index=True)  # pdf, docx, txt, csv, xlsx
    file_size = Column(Integer, nullable=False)
    storage_path = Column(String, nullable=True)
    status = Column(String, default='completed', index=True)  # uploaded, pending, processing, completed, failed
    page_count = Column(Integer, default=1)
    word_count = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    key_points_json = Column(Text, nullable=True)  # JSON serialized list of strings
    entities_json = Column(Text, nullable=True)    # JSON serialized structured entities
    raw_content = Column(Text, nullable=True)
    starred = Column(Boolean, default=False, index=True)
    tags_json = Column(Text, default='["General"]')  # JSON list
    created_at = Column(DateTime, default=get_utc_now, index=True)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    owner = relationship('User', back_populates='documents')
    collections = relationship('Collection', secondary=collection_documents, back_populates='documents')
    chunks = relationship('DocumentChunk', back_populates='document', cascade='all, delete-orphan')
    versions = relationship('DocumentVersion', back_populates='document', cascade='all, delete-orphan')

class DocumentVersion(Base):
    __tablename__ = 'document_versions'

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey('documents.id', ondelete='CASCADE'), nullable=False, index=True)
    version_number = Column(Integer, default=1)
    summary = Column(String, nullable=True)
    author = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    document = relationship('Document', back_populates='versions')

class Collection(Base):
    __tablename__ = 'collections'

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    color = Column(String, default='#2563EB')
    icon = Column(String, default='Folder')
    is_private = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    owner = relationship('User', back_populates='collections')
    documents = relationship('Document', secondary=collection_documents, back_populates='collections')

class DocumentChunk(Base):
    __tablename__ = 'document_chunks'

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey('documents.id', ondelete='CASCADE'), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, default=1)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    embedding_json = Column(Text, nullable=True)  # JSON-encoded float array or vector
    metadata_json = Column(Text, nullable=True)

    document = relationship('Document', back_populates='chunks')

class Conversation(Base):
    __tablename__ = 'conversations'

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = Column(String, default='New Document Conversation')
    collection_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    user = relationship('User', back_populates='conversations')
    messages = relationship('Message', back_populates='conversation', cascade='all, delete-orphan')

class Message(Base):
    __tablename__ = 'messages'

    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False, index=True)
    role = Column(String, nullable=False)  # user or assistant
    content = Column(Text, nullable=False)
    citations_json = Column(Text, nullable=True)  # JSON-serialized citations
    suggested_questions_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    conversation = relationship('Conversation', back_populates='messages')

class SearchHistory(Base):
    __tablename__ = 'search_history'

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    query_text = Column(String, nullable=False)
    search_type = Column(String, default='hybrid')  # keyword, semantic, hybrid
    result_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now)

class DocumentComparison(Base):
    __tablename__ = 'document_comparisons'

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    doc_a_id = Column(String, ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    doc_b_id = Column(String, ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    similarity_score = Column(Float, default=0.0)
    additions_count = Column(Integer, default=0)
    deletions_count = Column(Integer, default=0)
    modifications_count = Column(Integer, default=0)
    diffs_json = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

class Report(Base):
    __tablename__ = 'reports'

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = Column(String, nullable=False)
    report_type = Column(String, default='executive_audit')
    content_json = Column(Text, nullable=True)
    pdf_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

class ActivityLog(Base):
    __tablename__ = 'activity_logs'

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    action = Column(String, nullable=False)
    target_type = Column(String, nullable=False)  # document, collection, comparison, auth, settings
    target_title = Column(String, nullable=False)
    status = Column(String, default='success')    # success, warning, info, failed
    details = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, index=True)

    user = relationship('User', back_populates='activity_logs')

class ApiKey(Base):
    __tablename__ = 'api_keys'

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String, nullable=False)
    prefix = Column(String, nullable=False)
    hashed_key = Column(String, nullable=False)
    status = Column(String, default='active')
    last_used = Column(String, default='Never')
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship('User', back_populates='api_keys')

class UserSession(Base):
    __tablename__ = 'user_sessions'

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    device = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    location = Column(String, default='San Francisco, CA, US')
    last_active = Column(String, default='Just now')
    is_current = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship('User', back_populates='sessions')
